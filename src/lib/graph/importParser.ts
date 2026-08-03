import type { Edge } from '@xyflow/react';
import type { FileNodeData, NodeConnections } from '../../types';

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

/**
 * Scans every file's source for relative-path `import ... from './...'` lines,
 * resolves each one against the workspace's own files (skipping bare package
 * imports like 'react'), and produces both the React Flow edges to draw and a
 * per-file map of which source lines have an import/export handle attached.
 */
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