import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, FileCode2, Folder, FolderOpen } from 'lucide-react';
import type { WorkspaceTreeNode } from '../types';
import { cn } from '../lib/utils';

interface WorkspaceTreeProps {
  tree: WorkspaceTreeNode[];
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
  hiddenPaths: Set<string>;
  onToggleFileHidden: (filePath: string) => void;
  selectedFilePath: string | null;
}

interface TreeNodeProps {
  node: WorkspaceTreeNode;
  depth: number;
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
  hiddenPaths: Set<string>;
  onToggleFileHidden: (filePath: string) => void;
  selectedFilePath: string | null;
}

function isAncestorOf(ancestorPath: string, path: string): boolean {
  return path === ancestorPath || path.startsWith(`${ancestorPath}/`);
}

function TreeNode({
  node,
  depth,
  isLight,
  onFileSelect,
  hiddenPaths,
  onToggleFileHidden,
  selectedFilePath,
}: TreeNodeProps) {
  const [manuallyExpanded, setManuallyExpanded] = useState<boolean | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const containsSelection =
    selectedFilePath !== null && !node.isFile && isAncestorOf(node.path, selectedFilePath);
  const expanded = manuallyExpanded ?? (depth < 2 || containsSelection);
  const isSelected = node.isFile && node.path === selectedFilePath;
  const isHidden = node.isFile && hiddenPaths.has(node.path);

  // If a folder was manually collapsed but now contains the selected file,
  // let auto-expand take back over so the selection stays reachable.
  useEffect(() => {
    if (containsSelection && manuallyExpanded === false) {
      setManuallyExpanded(null);
    }
  }, [containsSelection, manuallyExpanded]);

  useEffect(() => {
    if (isSelected) {
      nodeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  if (node.isFile) {
    return (
      <div
        ref={nodeRef}
        className={cn(
          'group flex w-full items-center gap-1 rounded pr-1 text-left text-sm',
          isSelected
            ? isLight
              ? 'bg-blue-50'
              : 'bg-blue-500/10'
            : isLight
              ? 'hover:bg-neutral-100'
              : 'hover:bg-white/5',
        )}
      >
        <button
          type="button"
          onClick={() => onFileSelect(node.path)}
          className="flex flex-1 items-center gap-2 overflow-hidden py-1.5 text-left"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <FileCode2 className={cn('h-3.5 w-3.5 shrink-0', isHidden ? 'text-neutral-500' : 'text-blue-400')} />
          <span
            className={cn(
              'truncate font-mono text-sm',
              isHidden && 'italic opacity-50',
              isSelected ? 'text-blue-500' : isLight ? 'text-neutral-700' : 'text-neutral-300',
            )}
          >
            {node.name}
          </span>
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFileHidden(node.path);
          }}
          className={cn(
            'shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100',
            isHidden && 'opacity-100',
            isLight ? 'hover:bg-neutral-200' : 'hover:bg-neutral-800',
          )}
          style={{ color: isLight ? '#71717a' : '#a3a3a3' }}
          title={isHidden ? 'Show node in graph' : 'Hide node from graph'}
        >
          {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setManuallyExpanded(!expanded)}
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
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            isLight={isLight}
            onFileSelect={onFileSelect}
            hiddenPaths={hiddenPaths}
            onToggleFileHidden={onToggleFileHidden}
            selectedFilePath={selectedFilePath}
          />
        ))}
    </div>
  );
}

export function WorkspaceTree({
  tree,
  isLight,
  onFileSelect,
  hiddenPaths,
  onToggleFileHidden,
  selectedFilePath,
}: WorkspaceTreeProps) {
  if (tree.length === 0) {
    return <p className={cn('text-sm', isLight ? 'text-neutral-500' : 'text-neutral-500')}>No source files loaded.</p>;
  }

  return (
    <div className="custom-scrollbar max-h-64 overflow-y-auto pr-1">
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          isLight={isLight}
          onFileSelect={onFileSelect}
          hiddenPaths={hiddenPaths}
          onToggleFileHidden={onToggleFileHidden}
          selectedFilePath={selectedFilePath}
        />
      ))}
    </div>
  );
}