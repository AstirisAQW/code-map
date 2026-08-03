import type { FileNodeData, WorkspaceTreeNode } from '../types';

export function buildWorkspaceTree(files: FileNodeData[]): WorkspaceTreeNode[] {
  const root: WorkspaceTreeNode = {
    name: '',
    path: '',
    children: [],
    isFile: false,
  };

  for (const file of files) {
    const segments = file.path.replace(/^\//, '').split('/');
    let current = root;

    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      const isFile = index === segments.length - 1;
      const segmentPath = `/${segments.slice(0, index + 1).join('/')}`;

      let child = current.children.find((node) => node.name === segment);
      if (!child) {
        child = {
          name: segment,
          path: segmentPath,
          children: [],
          isFile,
        };
        current.children.push(child);
      }

      current = child;
    }
  }

  sortTreeNodes(root.children);
  return root.children;
}

function sortTreeNodes(nodes: WorkspaceTreeNode[]): void {
  nodes.sort((left, right) => {
    if (left.isFile !== right.isFile) {
      return left.isFile ? 1 : -1;
    }
    return left.name.localeCompare(right.name);
  });

  for (const node of nodes) {
    if (!node.isFile) {
      sortTreeNodes(node.children);
    }
  }
}

/** True if `path` is `parentPath` itself or lives somewhere under it. */
export function isParentOf(parentPath: string, path: string): boolean {
  return path === parentPath || path.startsWith(`${parentPath}/`);
}