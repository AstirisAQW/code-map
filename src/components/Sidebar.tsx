import { FolderOpen } from 'lucide-react';
import { buildWorkspaceTree } from '../lib/workspaceTree';
import { getLoadingLabel } from '../lib/loadingLabel';
import type { FileNodeData, LoadingProgress, UiMode } from '../types';
import { cn } from '../lib/utils';
import { SidebarHeader } from './SidebarHeader';
import { WorkspaceTree } from './workspace-tree/WorkspaceTree';

interface SidebarProps {
  uiMode: UiMode;
  onUiModeChange: (mode: UiMode) => void;
  directoryName: string | null;
  files: FileNodeData[];
  loading: boolean;
  loadingProgress: LoadingProgress | null;
  isOpen: boolean;
  onOpenFolder: () => void;
  onFileSelect: (filePath: string) => void;
  hiddenPaths: Set<string>;
  onToggleFileHidden: (filePath: string) => void;
  selectedFilePath: string | null;
}

export function Sidebar({
  uiMode,
  onUiModeChange,
  directoryName,
  files,
  loading,
  loadingProgress,
  isOpen,
  onOpenFolder,
  onFileSelect,
  hiddenPaths,
  onToggleFileHidden,
  selectedFilePath,
}: SidebarProps) {
  const isLight = uiMode === 'light';
  const workspaceTree = buildWorkspaceTree(files);

  return (
    <div
      className={cn(
        'relative z-10 flex shrink-0 flex-col border-r transition-all duration-300',
        isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-[#111111]',
        isOpen ? 'w-80 opacity-100' : 'w-0 overflow-hidden opacity-0',
      )}
    >
      <div className="flex h-full w-80 flex-col p-6">
        <SidebarHeader uiMode={uiMode} onUiModeChange={onUiModeChange} isLight={isLight} />

        <div className="custom-scrollbar -mr-2 flex-1 overflow-y-auto pr-2">
          <p className={cn('mb-6 text-sm leading-relaxed', isLight ? 'text-neutral-600' : 'text-neutral-400')}>
            Open a local folder to visualize your codebase architecture, file dependencies, and full source code in an
            interactive node graph.
          </p>

          <button
            type="button"
            onClick={onOpenFolder}
            disabled={loading}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2.5 font-medium transition-all disabled:opacity-50',
              isLight
                ? 'border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50'
                : 'border-transparent bg-white text-black hover:bg-neutral-200',
            )}
          >
            <FolderOpen className="h-4 w-4" />
            {getLoadingLabel(loadingProgress, loading)}
          </button>

          {directoryName && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Workspace</div>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
                  {files.length} files{hiddenPaths.size > 0 ? ` · ${hiddenPaths.size} hidden` : ''}
                </span>
              </div>
              <div
                className={cn(
                  'mb-3 rounded-md border p-3 text-sm',
                  isLight ? 'border-neutral-200 bg-neutral-50 text-neutral-700' : 'border-neutral-800 bg-neutral-900 text-neutral-300',
                )}
              >
                {directoryName}
              </div>
              <WorkspaceTree
                tree={workspaceTree}
                isLight={isLight}
                onFileSelect={onFileSelect}
                hiddenPaths={hiddenPaths}
                onToggleFileHidden={onToggleFileHidden}
                selectedFilePath={selectedFilePath}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}