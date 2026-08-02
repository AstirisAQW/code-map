import type { Edge, Node } from '@xyflow/react';
import type { FileNodeData, NodeConnections } from '../types';

const IMPORT_EDGE_STYLE = { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.8 };

function resolvePath(currentPath: string, importPath: string): string {
  const currentParts = currentPath.split('/');
  currentParts.pop();

  for (const part of importPath.split('/')) {
    if (part === '.') continue;
    if (part === '..') currentParts.pop();
    else currentParts.push(part);
  }

  return currentParts.join('/');
}

function buildFilePathIndex(files: FileNodeData[]): Map<string, FileNodeData> {
  const index = new Map<string, FileNodeData>();

  for (const file of files) {
    index.set(file.path, file);

    const pathWithoutExtension = file.path.replace(/\.[^/.]+$/, '');
    if (!index.has(pathWithoutExtension)) {
      index.set(pathWithoutExtension, file);
    }
  }

  return index;
}

function findTargetFile(
  pathIndex: Map<string, FileNodeData>,
  resolvedPath: string,
): FileNodeData | undefined {
  return (
    pathIndex.get(resolvedPath) ??
    pathIndex.get(`${resolvedPath}.ts`) ??
    pathIndex.get(`${resolvedPath}.tsx`) ??
    pathIndex.get(`${resolvedPath}.js`) ??
    pathIndex.get(`${resolvedPath}.jsx`) ??
    pathIndex.get(`${resolvedPath}/index.ts`) ??
    pathIndex.get(`${resolvedPath}/index.js`)
  );
}

function extractImportedSymbols(line: string): string[] {
  const symbolsMatch = line.match(/import\s+(?:\{\s*([^}]+)\s*\}|([^\s,]+))/);
  if (!symbolsMatch) return [];

  if (symbolsMatch[1]) {
    return symbolsMatch[1].split(',').map((symbol) => symbol.trim().split(/\s+as\s+/)[0]);
  }

  if (symbolsMatch[2]) {
    return [symbolsMatch[2]];
  }

  return [];
}

function findExportLineIndex(targetFile: FileNodeData, importedSymbols: string[]): number {
  if (importedSymbols.length === 0) return 0;

  const targetLines = targetFile.content.split('\n');
  for (let lineIndex = 0; lineIndex < targetLines.length; lineIndex++) {
    const line = targetLines[lineIndex];
    const isDefault = importedSymbols[0] && line.includes('export default');
    const hasNamedExport = importedSymbols.some(
      (symbol) =>
        line.includes(`export const ${symbol}`) ||
        line.includes(`export function ${symbol}`) ||
        line.includes(`export class ${symbol}`) ||
        line.includes(`export { ${symbol}`) ||
        line.includes(`export type ${symbol}`) ||
        line.includes(`export interface ${symbol}`),
    );

    if (isDefault || hasNamedExport) {
      return lineIndex;
    }
  }

  return 0;
}

export function parseEdges(files: FileNodeData[]): {
  edges: Edge[];
  nodeConnections: Record<string, NodeConnections>;
} {
  const edges: Edge[] = [];
  const nodeConnections: Record<string, NodeConnections> = {};
  const pathIndex = buildFilePathIndex(files);

  for (const file of files) {
    nodeConnections[file.path] = { imports: [], exports: [] };
  }

  for (const file of files) {
    const lines = file.content.split('\n');

    lines.forEach((line, lineIndex) => {
      const importMatch = line.match(/import\s+(?:\{[^}]+\}|[^'"]+)?\s*from\s+['"]([^'"]+)['"]/);
      if (!importMatch?.[1]) return;

      const importPath = importMatch[1];
      if (!importPath.startsWith('.')) return;

      const targetFile = findTargetFile(pathIndex, resolvePath(file.path, importPath));
      if (!targetFile) return;

      const importedSymbols = extractImportedSymbols(line);
      const targetLineIndex = findExportLineIndex(targetFile, importedSymbols);

      if (!nodeConnections[file.path].imports.includes(lineIndex)) {
        nodeConnections[file.path].imports.push(lineIndex);
      }
      if (!nodeConnections[targetFile.path].exports.includes(targetLineIndex)) {
        nodeConnections[targetFile.path].exports.push(targetLineIndex);
      }

      edges.push({
        id: `e-${file.path}-${lineIndex}-${targetFile.path}-${targetLineIndex}`,
        source: file.path,
        target: targetFile.path,
        sourceHandle: `src-${lineIndex}`,
        targetHandle: `tgt-${targetLineIndex}`,
        animated: true,
        style: IMPORT_EDGE_STYLE,
      });
    });
  }

  return { edges, nodeConnections };
}

/**
 * Assigns each file to a column ("layer") based on the import graph rather than
 * a fixed row width. A file that isn't imported by anything else in the
 * workspace starts at layer 0; every file it imports is pushed to at least one
 * layer to the right. This keeps importer -> imported relationships flowing in
 * one direction so the connecting edges stay short and readable, instead of
 * wrapping into a grid that scatters related files across unrelated rows.
 */
function computeDependencyLayers(files: FileNodeData[], edges: Edge[]): Map<string, number> {
  const layer = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const file of files) {
    layer.set(file.path, 0);
    adjacency.set(file.path, []);
    inDegree.set(file.path, 0);
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !inDegree.has(edge.target)) continue;
    adjacency.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Kahn's algorithm: process files with no remaining incoming edges first,
  // pushing every file they import at least one layer further right.
  const queue: string[] = files.filter((file) => (inDegree.get(file.path) ?? 0) === 0).map((file) => file.path);
  const visited = new Set<string>();
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    visited.add(current);
    const currentLayer = layer.get(current) ?? 0;

    for (const next of adjacency.get(current) ?? []) {
      layer.set(next, Math.max(layer.get(next) ?? 0, currentLayer + 1));
      const remaining = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, remaining);
      if (remaining <= 0 && !visited.has(next)) {
        queue.push(next);
      }
    }
  }

  // Files left over are part of an import cycle. Give each a layer based on
  // whichever neighbour already has one, so cycles don't collapse to layer 0.
  for (const file of files) {
    if (visited.has(file.path)) continue;
    const neighbourLayers = (adjacency.get(file.path) ?? [])
      .map((target) => layer.get(target) ?? 0)
      .filter((value) => value > 0);
    if (neighbourLayers.length > 0) {
      layer.set(file.path, Math.max(...neighbourLayers));
    }
  }

  return layer;
}

export function createNodes(
  files: FileNodeData[],
  nodeConnections: Record<string, NodeConnections>,
  edges: Edge[],
): Node[] {
  const xSpacing = 700;
  const ySpacing = 80;
  const layers = computeDependencyLayers(files, edges);
  const columnNextY = new Map<number, number>();

  return files.map((file) => {
    const layerIndex = layers.get(file.path) ?? 0;
    const y = columnNextY.get(layerIndex) ?? 0;

    const lineCount = file.content.split('\n').length;
    const estimatedHeight = Math.min(lineCount * 18 + 100, 1500);
    columnNextY.set(layerIndex, y + estimatedHeight + ySpacing);

    return {
      id: file.path,
      position: { x: layerIndex * xSpacing, y },
      data: { file, connections: nodeConnections[file.path] ?? { imports: [], exports: [] } },
      type: 'fileNode',
      dragHandle: '.custom-drag-handle',
    };
  });
}