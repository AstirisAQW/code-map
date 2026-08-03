import { useEffect, useRef } from 'react';
import { Eye, EyeOff, FileCode2 } from 'lucide-react';
import type { WorkspaceTreeNode } from '../../types';
import { cn } from '../../lib/utils';

interface FileRowProps {
  node: WorkspaceTreeNode;
  depth: number;
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
  hiddenPaths: Set<string>;
  onToggleFileHidden: (filePath: string) => void;
  selectedFilePath: string | null;
}

export function FileRow({
  node,
  depth,
  isLight,
  onFileSelect,
  hiddenPaths,
  onToggleFileHidden,
  selectedFilePath,
}: FileRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isSelected = node.path === selectedFilePath;
  const isHidden = hiddenPaths.has(node.path);

  useEffect(() => {
    if (isSelected) {
      rowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <div
      ref={rowRef}
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