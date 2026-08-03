import type { WorkspaceTreeNode } from '../../types';
import { cn } from '../../lib/utils';
import { FolderRow } from './FolderRow';
import { FileRow } from './FileRow';

interface WorkspaceTreeProps {
  tree: WorkspaceTreeNode[];
  isLight: boolean;
  onFileSelect: (filePath: string) => void;
  hiddenPaths: Set<string>;
  onToggleFileHidden: (filePath: string) => void;
  selectedFilePath: string | null;
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
      {tree.map((node) =>
        node.isFile ? (
          <FileRow
            key={node.path}
            node={node}
            depth={0}
            isLight={isLight}
            onFileSelect={onFileSelect}
            hiddenPaths={hiddenPaths}
            onToggleFileHidden={onToggleFileHidden}
            selectedFilePath={selectedFilePath}
          />
        ) : (
          <FolderRow
            key={node.path}
            node={node}
            depth={0}
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