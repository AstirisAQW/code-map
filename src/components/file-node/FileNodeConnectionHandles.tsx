import { Handle, Position } from '@xyflow/react';
import type { NodeConnections } from '../../types';

interface FileNodeConnectionHandlesProps {
  connections: NodeConnections;
  collapsed: boolean;
  nodeBackground: string;
  paddingTop: number;
  lineHeight: number;
}

export function FileNodeConnectionHandles({
  connections,
  collapsed,
  nodeBackground,
  paddingTop,
  lineHeight,
}: FileNodeConnectionHandlesProps) {
  return (
    <>
      {connections.imports.map((lineIndex) => (
        <Handle
          key={`src-${lineIndex}`}
          id={`src-${lineIndex}`}
          type="source"
          position={Position.Right}
          style={{
            top: collapsed ? 0 : paddingTop + lineIndex * lineHeight + lineHeight / 2,
            borderColor: nodeBackground,
            opacity: collapsed ? 0 : 1,
          }}
          className="h-2! w-2! border-2! bg-blue-400!"
        />
      ))}

      {connections.exports.map((lineIndex) => (
        <Handle
          key={`tgt-${lineIndex}`}
          id={`tgt-${lineIndex}`}
          type="target"
          position={Position.Left}
          style={{
            top: collapsed ? 0 : paddingTop + lineIndex * lineHeight + lineHeight / 2,
            borderColor: nodeBackground,
            opacity: collapsed ? 0 : 1,
          }}
          className="h-2! w-2! border-2! bg-green-400!"
        />
      ))}
    </>
  );
}