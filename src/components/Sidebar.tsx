import { useEffect, useRef, useState } from 'react';
import { FolderOpen, Layers, Monitor, Palette } from 'lucide-react';
import { buildWorkspaceTree } from '../lib/workspaceTree';
import type { FileNodeData, LoadingProgress, SyntaxThemeName, UiMode } from '../types';
import { useSyntaxTheme } from '../hooks/useSyntaxTheme';
import { cn } from '../lib/utils';
import { WorkspaceTree } from './WorkspaceTree';

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

function getLoadingLabel(progress: LoadingProgress | null, loading: boolean): string {
  if (!loading) return 'Open Folder';
  if (!progress) return 'Analyzing...';

  if (progress.phase === 'reading') {
    if (progress.total === 0) return 'Scanning files...';
    return `Reading ${progress.current}/${progress.total} files...`;
  }
  if (progress.phase === 'parsing') return 'Parsing imports...';
  return 'Building graph...';
}

function useCloseOnOutsideClick(onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [onClose]);

  return containerRef;
}

interface PanelThemeDropdownProps {
  uiMode: UiMode;
  onUiModeChange: (mode: UiMode) => void;
  isLight: boolean;
}

function PanelThemeDropdown({ uiMode, onUiModeChange, isLight }: PanelThemeDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(() => setOpen(false));

  const options: { value: UiMode; label: string }[] = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="Panel theme"
        aria-label="Panel theme"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
          isLight
            ? 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800',
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-md border py-1 shadow-xl',
            isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-900',
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onUiModeChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                option.value === uiMode
                  ? 'text-blue-500'
                  : isLight
                    ? 'text-neutral-700 hover:bg-neutral-50'
                    : 'text-neutral-300 hover:bg-white/5',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GraphThemeDropdown({ isLight }: { isLight: boolean }) {
  const { themeName, setThemeName } = useSyntaxTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(() => setOpen(false));

  const options: { value: SyntaxThemeName; label: string }[] = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="Graph theme"
        aria-label="Graph theme"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
          isLight
            ? 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800',
        )}
      >
        <Palette className="h-4 w-4" />
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-md border py-1 shadow-xl',
            isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-900',
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setThemeName(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                option.value === themeName
                  ? 'text-blue-500'
                  : isLight
                    ? 'text-neutral-700 hover:bg-neutral-50'
                    : 'text-neutral-300 hover:bg-white/5',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <h1 className={cn('flex-1 text-lg font-semibold tracking-tight', isLight ? 'text-black' : 'text-white')}>
            Code Canvas
          </h1>
          <PanelThemeDropdown uiMode={uiMode} onUiModeChange={onUiModeChange} isLight={isLight} />
          <GraphThemeDropdown isLight={isLight} />
        </div>

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