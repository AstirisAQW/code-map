import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSyntaxTheme } from '../../hooks/useSyntaxTheme';
import { useFocusNode } from '../../hooks/useFocusNode';
import { useAutoLayoutOnMeasure } from '../../hooks/useAutoLayoutOnMeasure';
import { FileNode } from '../file-node/FileNode';
import { EmptyState } from '../EmptyState';
import { CanvasToolbar } from './CanvasToolbar';

const nodeTypes = { fileNode: FileNode };

export interface GraphCanvasInnerProps {
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

export function GraphCanvasInner({
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
}: GraphCanvasInnerProps) {
  const { themeName, graphColors } = useSyntaxTheme();

  useFocusNode(focusNodePath, onFocusComplete);
  useAutoLayoutOnMeasure(nodes.length, onRelayout);

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

        <CanvasToolbar graphColors={graphColors} onToggleSidebar={onToggleSidebar} onRelayout={onRelayout} />
      </ReactFlow>

      {showEmptyState && <EmptyState onLoadSample={onLoadSample} />}
    </div>
  );
}