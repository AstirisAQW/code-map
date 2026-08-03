import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { useSyntaxTheme } from '../../hooks/useSyntaxTheme';
import type { FileNodeData, NodeConnections } from '../../types';
import { FileNodeHeader } from './FileNodeHeader';
import { FileNodeConnectionHandles } from './FileNodeConnectionHandles';
import { FileNodeBody } from './FileNodeBody';

export type FileNodeType = Node<
  {
    file: FileNodeData;
    connections?: NodeConnections;
  },
  'fileNode'
>;

const LINE_HEIGHT = 18;
const PADDING_TOP = 16;

export function FileNode({ id, data, selected }: NodeProps<FileNodeType>) {
  const { file, connections = { imports: [], exports: [] } } = data;
  const { syntaxTheme, codeBackground, lineNumberColor, themeName, graphColors } = useSyntaxTheme();
  const isLight = themeName === 'light';
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [collapsed, id, updateNodeInternals]);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleCollapse = (event: React.MouseEvent) => {
    event.stopPropagation();
    setCollapsed((value) => !value);
  };

  return (
    <div
      className="group relative flex min-w-100 max-w-200 flex-col overflow-hidden rounded-xl border shadow-2xl transition-colors duration-200"
      style={{
        backgroundColor: graphColors.nodeBackground,
        borderColor: selected ? graphColors.nodeSelectedBorder : graphColors.nodeBorder,
        boxShadow: selected ? '0 0 15px rgba(59, 130, 246, 0.3)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="h-3! w-3! opacity-0" />

      <FileNodeHeader
        file={file}
        isLight={isLight}
        graphColors={graphColors}
        copied={copied}
        collapsed={collapsed}
        onCopy={handleCopy}
        onToggleCollapse={handleToggleCollapse}
      />

      <div
        className={`relative nodrag cursor-text select-text transition-all duration-300 **:select-text ${
          collapsed ? 'h-0 overflow-hidden' : 'h-auto'
        }`}
      >
        <FileNodeConnectionHandles
          connections={connections}
          collapsed={collapsed}
          nodeBackground={graphColors.nodeBackground}
          paddingTop={PADDING_TOP}
          lineHeight={LINE_HEIGHT}
        />

        {!collapsed && (
          <FileNodeBody
            file={file}
            syntaxTheme={syntaxTheme}
            codeBackground={codeBackground}
            lineNumberColor={lineNumberColor}
            themeName={themeName}
            paddingTop={PADDING_TOP}
            lineHeight={LINE_HEIGHT}
          />
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3! w-3! opacity-0" />
    </div>
  );
}