const FILE_TYPE_COLORS: Record<string, string> = {
  '.ts': 'text-blue-400',
  '.tsx': 'text-blue-400',
  '.js': 'text-yellow-400',
  '.jsx': 'text-yellow-400',
  '.css': 'text-sky-400',
  '.html': 'text-orange-400',
  '.json': 'text-green-400',
  '.md': 'text-purple-400',
};

export function getFileColor(name: string): string {
  for (const [extension, colorClass] of Object.entries(FILE_TYPE_COLORS)) {
    if (name.endsWith(extension)) return colorClass;
  }
  return 'text-neutral-400';
}