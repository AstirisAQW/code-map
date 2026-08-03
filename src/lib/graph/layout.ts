import type { Edge, Node } from '@xyflow/react';
import type { FileNodeData, NodeConnections } from '../../types';
import { computeDependencyLayers } from './dependencyLayers';

const INITIAL_X_SPACING = 700;
const INITIAL_Y_SPACING = 80;

/**
 * Builds the very first layout, before any node has been rendered/measured.
 * Height is only an estimate from line count, so nodes with unusually dense
 * or wide content can still overlap here — relayoutByMeasuredSize corrects
 * that once real sizes are known.
 */
export function createNodes(
  files: FileNodeData[],
  nodeConnections: Record<string, NodeConnections>,
  edges: Edge[],
): Node[] {
  const layers = computeDependencyLayers(files, edges);
  const columnNextY = new Map<number, number>();

  return files.map((file) => {
    const layerIndex = layers.get(file.path) ?? 0;
    const y = columnNextY.get(layerIndex) ?? 0;

    const lineCount = file.content.split('\n').length;
    const estimatedHeight = Math.min(lineCount * 18 + 100, 1500);
    columnNextY.set(layerIndex, y + estimatedHeight + INITIAL_Y_SPACING);

    return {
      id: file.path,
      position: { x: layerIndex * INITIAL_X_SPACING, y },
      data: {
        file,
        connections: nodeConnections[file.path] ?? { imports: [], exports: [] },
        // Stored so relayoutByMeasuredSize can restack nodes column-by-column
        // once their real rendered size is known.
        layer: layerIndex,
      },
      type: 'fileNode',
      dragHandle: '.custom-drag-handle',
    };
  });
}

const RELAYOUT_X_GAP = 120;
const RELAYOUT_Y_GAP = 80;
const FALLBACK_NODE_WIDTH = 700;
const FALLBACK_NODE_HEIGHT = 300;

/**
 * Re-arranges nodes column by column (grouped by the dependency `layer`
 * stored on each node) using each node's actual rendered width/height
 * (`node.measured`, populated by React Flow's ResizeObserver) instead of the
 * fixed-width, line-count estimate used for the very first layout. This is
 * what keeps tall/wide file nodes from overlapping their neighbours once
 * real content is on screen. Hidden nodes are skipped when stacking so
 * hiding a file also closes the gap it left behind.
 */
export function relayoutByMeasuredSize(nodes: Node[]): Node[] {
  const layerGroups = new Map<number, Node[]>();

  for (const node of nodes) {
    const layer = (node.data as { layer?: number } | undefined)?.layer ?? 0;
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(node);
  }

  const positions = new Map<string, { x: number; y: number }>();
  const sortedLayers = [...layerGroups.keys()].sort((a, b) => a - b);
  let xOffset = 0;

  for (const layerKey of sortedLayers) {
    const group = layerGroups.get(layerKey)!;
    let y = 0;
    let maxWidth = 0;

    for (const node of group) {
      if (node.hidden) {
        positions.set(node.id, node.position);
        continue;
      }

      const width = node.measured?.width ?? FALLBACK_NODE_WIDTH;
      const height = node.measured?.height ?? FALLBACK_NODE_HEIGHT;
      maxWidth = Math.max(maxWidth, width);
      positions.set(node.id, { x: xOffset, y });
      y += height + RELAYOUT_Y_GAP;
    }

    xOffset += maxWidth + RELAYOUT_X_GAP;
  }

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position,
  }));
}