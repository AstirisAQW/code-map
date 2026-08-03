import { Layers, Monitor, Palette } from 'lucide-react';
import { useSyntaxTheme } from '../hooks/useSyntaxTheme';
import { cn } from '../lib/utils';
import { ThemeDropdown } from './ThemeDropdown';
import type { SyntaxThemeName, UiMode } from '../types';

interface SidebarHeaderProps {
  uiMode: UiMode;
  onUiModeChange: (mode: UiMode) => void;
  isLight: boolean;
}

const PANEL_THEME_OPTIONS: { value: UiMode; label: string }[] = [
  { value: 'dark', label: 'Dark Theme' },
  { value: 'light', label: 'Light Theme' },
];

const GRAPH_THEME_OPTIONS: { value: SyntaxThemeName; label: string }[] = [
  { value: 'dark', label: 'Dark Theme' },
  { value: 'light', label: 'Light Theme' },
];

export function SidebarHeader({ uiMode, onUiModeChange, isLight }: SidebarHeaderProps) {
  const { themeName, setThemeName } = useSyntaxTheme();

  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
        <Layers className="h-5 w-5 text-white" />
      </div>
      <h1 className={cn('flex-1 text-lg font-semibold tracking-tight', isLight ? 'text-black' : 'text-white')}>
        Code Canvas
      </h1>
      <ThemeDropdown
        value={uiMode}
        options={PANEL_THEME_OPTIONS}
        onChange={onUiModeChange}
        icon={Monitor}
        title="Panel theme"
        isLight={isLight}
      />
      <ThemeDropdown
        value={themeName}
        options={GRAPH_THEME_OPTIONS}
        onChange={setThemeName}
        icon={Palette}
        title="Graph theme"
        isLight={isLight}
      />
    </div>
  );
}