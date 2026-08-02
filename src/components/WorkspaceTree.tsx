import { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode2, Folder, FolderOpen } from 'lucide-react';
import type { WorkspaceTreeNode } from '../types';
import { cn } from '../lib/utils';

interface WorkspaceTreeProps {
  tree: WorkspaceTreeNode[];
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
}

interface TreeNodeProps {
  node: WorkspaceTreeNode;
  depth: number;
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
}

function TreeNode({ node, depth, isLight, onFileSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (node.isFile) {
    return (
      <button
        type="button"
        onClick={() => onFileSelect(node.path)}
        className={cn(
          'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
          isLight ? 'hover:bg-neutral-100' : 'hover:bg-white/5',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <FileCode2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
        <span className={cn('truncate font-mono text-sm', isLight ? 'text-neutral-700' : 'text-neutral-300')}>
          {node.name}
        </span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className={cn(
          'flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm',
          isLight ? 'hover:bg-neutral-100' : 'hover:bg-white/5',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
        )}
        {expanded ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        )}
        <span className={cn('truncate font-mono', isLight ? 'text-neutral-600' : 'text-neutral-400')}>{node.name}</span>
      </button>
      {expanded &&
        node.children.map((child) => (
          <TreeNode key={child.path} node={child} depth={depth + 1} isLight={isLight} onFileSelect={onFileSelect} />
        ))}
    </div>
  );
}

export function WorkspaceTree({ tree, isLight, onFileSelect }: WorkspaceTreeProps) {
  if (tree.length === 0) {
    return <p className={cn('text-sm', isLight ? 'text-neutral-500' : 'text-neutral-500')}>No source files loaded.</p>;
  }

  return (
    <div className="custom-scrollbar max-h-64 overflow-y-auto pr-1">
      {tree.map((node) => (
        <TreeNode key={node.path} node={node} depth={0} isLight={isLight} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
}
