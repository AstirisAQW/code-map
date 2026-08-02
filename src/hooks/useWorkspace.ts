import { useCallback, useState } from 'react';
import { useEdgesState, useNodesState, type Edge, type Node } from '@xyflow/react';
import { readDirectory } from '../lib/fileSystem';
import { createNodes, parseEdges, relayoutByMeasuredSize } from '../lib/parser';
import { sampleFiles } from '../lib/sampleData';
import type { FileNodeData, LoadingProgress } from '../types';

function buildGraph(files: FileNodeData[]) {
  const { edges, nodeConnections } = parseEdges(files);
  const nodes = createNodes(files, nodeConnections, edges);
  return { nodes, edges };
}

export function useWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [files, setFiles] = useState<FileNodeData[]>([]);
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [hiddenPaths, setHiddenPaths] = useState<Set<string>>(new Set());

  const loadFiles = useCallback(
    (nextFiles: FileNodeData[], name: string) => {
      setLoadingProgress({ phase: 'parsing', current: 0, total: nextFiles.length });
      const graph = buildGraph(nextFiles);
      setLoadingProgress({ phase: 'layout', current: nextFiles.length, total: nextFiles.length });
      setFiles(nextFiles);
      setDirectoryName(name);
      setHiddenPaths(new Set());
      setNodes(graph.nodes);
      setEdges(graph.edges);
    },
    [setEdges, setNodes],
  );

  const loadSampleData = useCallback(() => {
    loadFiles(sampleFiles, 'Sample Project');
  }, [loadFiles]);

  const openFolder = useCallback(async () => {
    if (!('showDirectoryPicker' in window)) {
      alert(
        "Your browser doesn't support the File System Access API. Please use a recent desktop browser like Chrome or Edge.",
      );
      return;
    }

    try {
      const dirHandle = await window.showDirectoryPicker();
      setLoading(true);
      setLoadingProgress({ phase: 'reading', current: 0, total: 0 });

      const loadedFiles = await readDirectory(dirHandle, {
        onProgress: (current, total) => {
          setLoadingProgress({ phase: 'reading', current, total });
        },
      });

      loadFiles(loadedFiles, dirHandle.name);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingProgress(null);
    }
  }, [loadFiles]);

  // Toggles a file's node in/out of the graph. hiddenPaths drives the
  // sidebar's eye icon; node.hidden drives React Flow (which also hides
  // that node's connected edges automatically).
  const toggleFileHidden = useCallback(
    (filePath: string) => {
      setHiddenPaths((current) => {
        const next = new Set(current);
        if (next.has(filePath)) {
          next.delete(filePath);
        } else {
          next.add(filePath);
        }
        return next;
      });

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === filePath ? { ...node, hidden: !(node.hidden ?? false) } : node,
        ),
      );
    },
    [setNodes],
  );

  const relayoutNodes = useCallback(() => {
    setNodes((currentNodes) => relayoutByMeasuredSize(currentNodes));
  }, [setNodes]);

  // Marks a node as selected in the graph (used when a file is picked from
  // the sidebar, so selection highlighting works in both directions).
  const selectFile = useCallback(
    (filePath: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({ ...node, selected: node.id === filePath })),
      );
    },
    [setNodes],
  );

  return {
    nodes,
    edges,
    files,
    directoryName,
    loading,
    loadingProgress,
    hiddenPaths,
    onNodesChange,
    onEdgesChange,
    loadSampleData,
    openFolder,
    setEdges,
    toggleFileHidden,
    relayoutNodes,
    selectFile,
  };
}