import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { FileCode2, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSyntaxTheme } from '../hooks/useSyntaxTheme';
import { cn } from '../lib/utils';
import type { FileNodeData, NodeConnections } from '../types';

export type FileNodeType = Node<
  {
    file: FileNodeData;
    connections?: NodeConnections;
  },
  'fileNode'
>;

const FILE_TYPE_COLORS: Record<string, string> = {
  '.ts': 'text-blue-400',
  '.tsx': 'text-blue-400',
  '.js': 'text-yellow-400',
  '.jsx': 'text-yellow-400',
  '.css': 'text-sky-400',
  '.html': 'text-orange-400',
  '.json': 'text-green-400',
  '.md': 'text-purple-400',
};

function getFileColor(name: string): string {
  for (const [extension, colorClass] of Object.entries(FILE_TYPE_COLORS)) {
    if (name.endsWith(extension)) return colorClass;
  }
  return 'text-neutral-400';
}

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

  const lineHeight = 18;
  const paddingTop = 16;

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

      <div
        className="custom-drag-handle flex cursor-grab items-center justify-between border-b px-4 py-3 active:cursor-grabbing"
        style={{ backgroundColor: graphColors.nodeHeaderBackground, borderColor: graphColors.nodeBorder }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FileCode2 className={`h-4 w-4 shrink-0 ${getFileColor(file.name)}`} />
          <span
            className="truncate font-mono text-sm font-medium"
            style={{ color: graphColors.nodeTitleText }}
          >
            {file.name}
          </span>
          <span
            className="truncate px-2 font-mono text-xs opacity-50"
            style={{ color: graphColors.nodePathText }}
          >
            {file.path}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'shrink-0 rounded p-1 transition-colors',
              isLight ? 'hover:bg-neutral-200' : 'hover:bg-neutral-800',
            )}
            style={{ color: graphColors.nodeIconText }}
            title="Copy Code"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setCollapsed((value) => !value);
            }}
            className={cn(
              'shrink-0 rounded p-1 transition-colors',
              isLight ? 'hover:bg-neutral-200' : 'hover:bg-neutral-800',
            )}
            style={{ color: graphColors.nodeIconText }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        className={`relative nodrag cursor-text select-text transition-all duration-300 **:select-text ${
          collapsed ? 'h-0 overflow-hidden' : 'h-auto'
        }`}
      >
        {connections.imports.map((lineIndex) => (
          <Handle
            key={`src-${lineIndex}`}
            id={`src-${lineIndex}`}
            type="source"
            position={Position.Right}
            style={{
              top: collapsed ? 0 : paddingTop + lineIndex * lineHeight + lineHeight / 2,
              borderColor: graphColors.nodeBackground,
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
              borderColor: graphColors.nodeBackground,
              opacity: collapsed ? 0 : 1,
            }}
            className="h-2! w-2! border-2! bg-green-400!"
          />
        ))}

        {!collapsed && (
          <SyntaxHighlighter
            key={themeName}
            language={file.language}
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              padding: `${paddingTop}px 1rem`,
              background: codeBackground,
              backgroundColor: codeBackground,
              fontSize: '12px',
              lineHeight: `${lineHeight}px`,
            }}
            showLineNumbers
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: lineNumberColor,
              textAlign: 'right',
            }}
          >
            {file.content}
          </SyntaxHighlighter>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3! w-3! opacity-0" />
    </div>
  );
}