import { ReactFlowProvider } from '@xyflow/react';
import { GraphCanvasInner, type GraphCanvasInnerProps } from './GraphCanvasInner';

export function GraphCanvas(props: GraphCanvasInnerProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}