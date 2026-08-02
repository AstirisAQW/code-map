export const ALLOWED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.html',
  '.json',
  '.md',
] as const;

export const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.cache',
  'vendor',
  '.turbo',
]);

export const MAX_FILE_SIZE_BYTES = 512 * 1024;
export const READ_CONCURRENCY = 8;

export interface GraphThemeColors {
  canvasBackground: string;
  dotColor: string;
  controlsBackground: string;
  controlsBorder: string;
  controlsIcon: string;
  minimapNode: string;
  minimapMask: string;
  nodeBackground: string;
  nodeBorder: string;
  nodeHeaderBackground: string;
  nodeSelectedBorder: string;
  nodeTitleText: string;
  nodePathText: string;
  nodeIconText: string;
  emptyIconBg: string;
  emptyIconBorder: string;
  emptyHeadingText: string;
  emptyBodyText: string;
  emptyIconColor: string;
}

export const GRAPH_THEME_COLORS: Record<'dark' | 'light', GraphThemeColors> = {
  dark: {
    canvasBackground: '#0E0E0E',
    dotColor: '#2A2A2A',
    controlsBackground: '#171717',
    controlsBorder: '#262626',
    controlsIcon: '#a3a3a3',
    minimapNode: '#333333',
    minimapMask: 'rgba(0, 0, 0, 0.7)',
    nodeBackground: '#0d0d0d',
    nodeBorder: '#262626',
    nodeHeaderBackground: '#151515',
    nodeSelectedBorder: '#3b82f6',
    nodeTitleText: '#e5e5e5',
    nodePathText: '#737373',
    nodeIconText: '#a3a3a3',
    emptyIconBg: '#171717',
    emptyIconBorder: '#262626',
    emptyHeadingText: '#d4d4d4',
    emptyBodyText: '#737373',
    emptyIconColor: '#525252',
  },
  light: {
    canvasBackground: '#F4F4F5',
    dotColor: '#D4D4D8',
    controlsBackground: '#FFFFFF',
    controlsBorder: '#E4E4E7',
    controlsIcon: '#52525B',
    minimapNode: '#A1A1AA',
    minimapMask: 'rgba(255, 255, 255, 0.75)',
    nodeBackground: '#FFFFFF',
    nodeBorder: '#E4E4E7',
    nodeHeaderBackground: '#FAFAFA',
    nodeSelectedBorder: '#3b82f6',
    nodeTitleText: '#27272a',
    nodePathText: '#a1a1aa',
    nodeIconText: '#71717a',
    emptyIconBg: '#FFFFFF',
    emptyIconBorder: '#E4E4E7',
    emptyHeadingText: '#3f3f46',
    emptyBodyText: '#71717a',
    emptyIconColor: '#a1a1aa',
  },
};