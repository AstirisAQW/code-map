import type { Edge } from '@xyflow/react';
import type { FileNodeData } from '../../types';

/**
 * Assigns each file to a column ("layer") based on the import graph rather than
 * a fixed row width. A file that isn't imported by anything else in the
 * workspace starts at layer 0; every file it imports is pushed to at least one
 * layer to the right. This keeps importer -> imported relationships flowing in
 * one direction so the connecting edges stay short and readable, instead of
 * wrapping into a grid that scatters related files across unrelated rows.
 */
export function computeDependencyLayers(files: FileNodeData[], edges: Edge[]): Map<string, number> {
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