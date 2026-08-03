import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import type { WorkspaceTreeNode } from '../../types';
import { cn } from '../../lib/utils';
import { isParentOf } from '../../lib/workspaceTree';
import { FileRow } from './FileRow';

interface FolderRowProps {
  node: WorkspaceTreeNode;
  depth: number;
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
  hiddenPaths: Set<string>;
  onToggleFileHidden: (filePath: string) => void;
  selectedFilePath: string | null;
}

export function FolderRow({
  node,
  depth,
  isLight,
  onFileSelect,
  hiddenPaths,
  onToggleFileHidden,
  selectedFilePath,
}: FolderRowProps) {
  const [manuallyExpanded, setManuallyExpanded] = useState<boolean | null>(null);

  const containsSelection = selectedFilePath !== null && isParentOf(node.path, selectedFilePath);
  const expanded = manuallyExpanded ?? (depth < 2 || containsSelection);

  // If a folder was manually collapsed but now contains the selected file,
  // let auto-expand take back over so the selection stays reachable.
  useEffect(() => {
    if (containsSelection && manuallyExpanded === false) {
      setManuallyExpanded(null);
    }
  }, [containsSelection, manuallyExpanded]);

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
        node.children.map((child) =>
          child.isFile ? (
            <FileRow
              key={child.path}
              node={child}
              depth={depth + 1}
              isLight={isLight}
              onFileSelect={onFileSelect}
              hiddenPaths={hiddenPaths}
              onToggleFileHidden={onToggleFileHidden}
              selectedFilePath={selectedFilePath}
            />
          ) : (
            <FolderRow
              key={child.path}
              node={child}
              depth={depth + 1}
              isLight={isLight}
              onFileSelect={onFileSelect}
              hiddenPaths={hiddenPaths}
              onToggleFileHidden={onToggleFileHidden}
              selectedFilePath={selectedFilePath}
            />
          ),
        )}
    </div>
  );
}