import { FolderOpen, Play } from 'lucide-react';
import { useSyntaxTheme } from '../hooks/useSyntaxTheme';

interface EmptyStateProps {
  onLoadSample: () => void;
}

export function EmptyState({ onLoadSample }: EmptyStateProps) {
  const { graphColors } = useSyntaxTheme();

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border shadow-2xl"
          style={{ backgroundColor: graphColors.emptyIconBg, borderColor: graphColors.emptyIconBorder }}
        >
          <FolderOpen className="h-8 w-8" style={{ color: graphColors.emptyIconColor }} />
        </div>
        <h2 className="mb-2 text-2xl font-semibold" style={{ color: graphColors.emptyHeadingText }}>
          No Workspace Loaded
        </h2>
        <p className="mx-auto mb-8 max-w-sm" style={{ color: graphColors.emptyBodyText }}>
          Open a local folder from the sidebar to start visualizing your codebase.
        </p>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
        >
          <Play className="h-4 w-4 fill-current" />
          Load Sample Project
        </button>
      </div>
    </div>
  );
}