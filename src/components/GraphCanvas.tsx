import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  MiniMap,
  useNodesInitialized,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnSelectionChangeParams,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LayoutTemplate, LayoutGrid } from 'lucide-react';
import { useSyntaxTheme } from '../hooks/useSyntaxTheme';
import { FileNode } from './FileNode';
import { EmptyState } from './EmptyState';

const nodeTypes = { fileNode: FileNode };

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Edge | Connection) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  showEmptyState: boolean;
  onLoadSample: () => void;
  focusNodePath: string | null;
  onFocusComplete: () => void;
  onSelectionChange: (filePaths: string[]) => void;
  onRelayout: () => void;
}

function GraphCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onToggleSidebar,
  showEmptyState,
  onLoadSample,
  focusNodePath,
  onFocusComplete,
  onSelectionChange,
  onRelayout,
}: GraphCanvasProps) {
  const { setCenter, getNode } = useReactFlow();
  const { themeName, graphColors } = useSyntaxTheme();
  const lastFocusedPath = useRef<string | null>(null);
  const nodesInitialized = useNodesInitialized();
  const hasAutoLaidOut = useRef(false);

  useEffect(() => {
    if (!focusNodePath || focusNodePath === lastFocusedPath.current) return;

    const node = getNode(focusNodePath);
    if (!node) {
      onFocusComplete();
      return;
    }

    lastFocusedPath.current = focusNodePath;
    const width = node.measured?.width ?? 400;
    const height = node.measured?.height ?? 200;
    setCenter(node.position.x + width / 2, node.position.y + height / 2, { zoom: 0.8, duration: 400 });
    onFocusComplete();
  }, [focusNodePath, getNode, onFocusComplete, setCenter]);

  // Once every node has been measured by React Flow for the first time,
  // replace the initial line-count-based positions with a layout based on
  // real rendered size so nothing overlaps.
  useEffect(() => {
    if (nodesInitialized && nodes.length > 0 && !hasAutoLaidOut.current) {
      hasAutoLaidOut.current = true;
      onRelayout();
    }
  }, [nodesInitialized, nodes.length, onRelayout]);

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      onSelectionChange(selectedNodes.map((node) => node.id));
    },
    [onSelectionChange],
  );

  return (
    <div className="relative flex-1" style={{ backgroundColor: graphColors.canvasBackground }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.05}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        colorMode={themeName}
        panOnScroll
        zoomActivationKeyCode="Control"
        style={{ backgroundColor: graphColors.canvasBackground }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color={graphColors.dotColor} />

        <Controls
          showInteractive={false}
          className="border"
          style={{
            backgroundColor: graphColors.controlsBackground,
            borderColor: graphColors.controlsBorder,
            fill: graphColors.controlsIcon,
          }}
        />

        <MiniMap
          nodeColor={graphColors.minimapNode}
          maskColor={graphColors.minimapMask}
          className="overflow-hidden rounded-lg border shadow-xl"
          style={{
            backgroundColor: graphColors.controlsBackground,
            borderColor: graphColors.controlsBorder,
          }}
        />

        <Panel position="top-left" className="m-4 flex gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg border p-2.5 shadow-xl transition-all"
            style={{
              backgroundColor: graphColors.controlsBackground,
              borderColor: graphColors.controlsBorder,
              color: graphColors.controlsIcon,
            }}
            title="Toggle Sidebar"
          >
            <LayoutTemplate className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onRelayout}
            className="rounded-lg border p-2.5 shadow-xl transition-all"
            style={{
              backgroundColor: graphColors.controlsBackground,
              borderColor: graphColors.controlsBorder,
              color: graphColors.controlsIcon,
            }}
            title="Auto-arrange nodes by their current size"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </Panel>
      </ReactFlow>

      {showEmptyState && <EmptyState onLoadSample={onLoadSample} />}
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}