import { FileCode2, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getFileColor } from '../../lib/fileTypeColors';
import type { GraphThemeColors } from '../../lib/constants';
import type { FileNodeData } from '../../types';

interface FileNodeHeaderProps {
  file: FileNodeData;
  isLight: boolean;
  graphColors: GraphThemeColors;
  copied: boolean;
  collapsed: boolean;
  onCopy: (event: React.MouseEvent) => void;
  onToggleCollapse: (event: React.MouseEvent) => void;
}

export function FileNodeHeader({
  file,
  isLight,
  graphColors,
  copied,
  collapsed,
  onCopy,
  onToggleCollapse,
}: FileNodeHeaderProps) {
  return (
    <div
      className="custom-drag-handle flex cursor-grab items-center justify-between border-b px-4 py-3 active:cursor-grabbing"
      style={{ backgroundColor: graphColors.nodeHeaderBackground, borderColor: graphColors.nodeBorder }}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <FileCode2 className={`h-4 w-4 shrink-0 ${getFileColor(file.name)}`} />
        <span className="truncate font-mono text-sm font-medium" style={{ color: graphColors.nodeTitleText }}>
          {file.name}
        </span>
        <span className="truncate px-2 font-mono text-xs opacity-50" style={{ color: graphColors.nodePathText }}>
          {file.path}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onCopy}
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
          onClick={onToggleCollapse}
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
  );
}