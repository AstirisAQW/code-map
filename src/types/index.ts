export interface FileNodeData {
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface NodeConnections {
  imports: number[];
  exports: number[];
}

export interface WorkspaceTreeNode {
  name: string;
  path: string;
  children: WorkspaceTreeNode[];
  isFile: boolean;
}

export type UiMode = 'dark' | 'light';

export type SyntaxThemeName = 'dark' | 'light';

export interface LoadingProgress {
  phase: 'reading' | 'parsing' | 'layout';
  current: number;
  total: number;
}