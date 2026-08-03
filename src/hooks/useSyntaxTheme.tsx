import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { vscDarkPlus, materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { GRAPH_THEME_COLORS, type GraphThemeColors } from '../lib/constants';
import type { SyntaxThemeName } from '../types';

type PrismTheme = Record<string, React.CSSProperties>;

// One main dark theme and one main light theme. Switching this also switches
// the graph canvas, controls, minimap, and file node chrome via graphColors,
// so the code highlighting and the surrounding graph always match.
const SYNTAX_THEME_STYLES: Record<SyntaxThemeName, PrismTheme> = {
  dark: vscDarkPlus,
  light: materialLight,
};

interface SyntaxThemeContextValue {
  themeName: SyntaxThemeName;
  setThemeName: (themeName: SyntaxThemeName) => void;
  syntaxTheme: PrismTheme;
  codeBackground: string;
  lineNumberColor: string;
  graphColors: GraphThemeColors;
}

const SyntaxThemeContext = createContext<SyntaxThemeContextValue | null>(null);

function getCodeBackground(theme: PrismTheme): string {
  const preStyle = theme['pre[class*="language-"]'] ?? theme['code[class*="language-"]'];
  return preStyle?.background?.toString() ?? '#1e1e1e';
}

function getLineNumberColor(theme: PrismTheme): string {
  const lineStyle = theme['.linenumber'] ?? theme['.token.comment'];
  return lineStyle?.color?.toString() ?? '#6e7681';
}

export function SyntaxThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<SyntaxThemeName>('dark');

  const value = useMemo(() => {
    const syntaxTheme = SYNTAX_THEME_STYLES[themeName];
    return {
      themeName,
      setThemeName,
      syntaxTheme,
      codeBackground: getCodeBackground(syntaxTheme),
      lineNumberColor: getLineNumberColor(syntaxTheme),
      graphColors: GRAPH_THEME_COLORS[themeName],
    };
  }, [themeName]);

  return <SyntaxThemeContext.Provider value={value}>{children}</SyntaxThemeContext.Provider>;
}

export function useSyntaxTheme(): SyntaxThemeContextValue {
  const context = useContext(SyntaxThemeContext);
  if (!context) {
    throw new Error('useSyntaxTheme must be used within SyntaxThemeProvider');
  }
  return context;
}