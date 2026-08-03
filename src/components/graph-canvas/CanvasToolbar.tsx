import { Panel } from '@xyflow/react';
import { LayoutTemplate, LayoutGrid } from 'lucide-react';
import type { GraphThemeColors } from '../../lib/constants';

interface CanvasToolbarProps {
  graphColors: GraphThemeColors;
  onToggleSidebar: () => void;
  onRelayout: () => void;
}

export function CanvasToolbar({ graphColors, onToggleSidebar, onRelayout }: CanvasToolbarProps) {
  const buttonStyle = {
    backgroundColor: graphColors.controlsBackground,
    borderColor: graphColors.controlsBorder,
    color: graphColors.controlsIcon,
  };

  return (
    <Panel position="top-left" className="m-4 flex gap-2">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg border p-2.5 shadow-xl transition-all"
        style={buttonStyle}
        title="Toggle Sidebar"
      >
        <LayoutTemplate className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onRelayout}
        className="rounded-lg border p-2.5 shadow-xl transition-all"
        style={buttonStyle}
        title="Auto-arrange nodes by their current size"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
    </Panel>
  );
}