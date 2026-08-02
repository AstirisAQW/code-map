import { useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LayoutTemplate } from 'lucide-react';
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
}: GraphCanvasProps) {
  const { setCenter, getNode } = useReactFlow();
  const { themeName, graphColors } = useSyntaxTheme();
  const lastFocusedPath = useRef<string | null>(null);

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

  return (
    <div className="relative flex-1" style={{ backgroundColor: graphColors.canvasBackground }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.05}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        colorMode={themeName}
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

        <Panel position="top-left" className="m-4">
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