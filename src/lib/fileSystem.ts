import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  READ_CONCURRENCY,
  SKIP_DIRS,
} from './constants';
import type { FileNodeData } from '../types';

export type { FileNodeData };

export interface ReadDirectoryOptions {
  onProgress?: (current: number, total: number) => void;
}

function getLanguage(extension: string): string {
  if (extension === '.ts' || extension === '.tsx') return 'typescript';
  if (extension === '.css') return 'css';
  if (extension === '.html') return 'html';
  if (extension === '.json') return 'json';
  if (extension === '.md') return 'markdown';
  return 'javascript';
}

function isAllowedFile(name: string): boolean {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const extension = name.slice(dotIndex);
  return ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number]);
}

async function collectFileEntries(
  dirHandle: FileSystemDirectoryHandle,
  path = '',
): Promise<Array<{ handle: FileSystemFileHandle; path: string; name: string }>> {
  const entries: Array<{ handle: FileSystemFileHandle; path: string; name: string }> = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      if (isAllowedFile(entry.name)) {
        entries.push({
          handle: entry as FileSystemFileHandle,
          path: `${path}/${entry.name}`,
          name: entry.name,
        });
      }
      continue;
    }

    if (entry.kind === 'directory' && !SKIP_DIRS.has(entry.name)) {
      const nestedEntries = await collectFileEntries(entry as FileSystemDirectoryHandle, `${path}/${entry.name}`);
      entries.push(...nestedEntries);
    }
  }

  return entries;
}

async function readFileEntry(
  entry: { handle: FileSystemFileHandle; path: string; name: string },
): Promise<FileNodeData | null> {
  try {
    const file = await entry.handle.getFile();
    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`Skipping large file: ${entry.name} (${file.size} bytes)`);
      return null;
    }

    const content = await file.text();
    const extension = entry.name.slice(entry.name.lastIndexOf('.'));

    return {
      name: entry.name,
      path: entry.path,
      content,
      language: getLanguage(extension),
    };
  } catch {
    console.warn(`Could not read file: ${entry.name}`);
    return null;
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker());
  await Promise.all(workers);
}

export async function readDirectory(
  dirHandle: FileSystemDirectoryHandle,
  options: ReadDirectoryOptions = {},
): Promise<FileNodeData[]> {
  const fileEntries = await collectFileEntries(dirHandle);
  const files: FileNodeData[] = [];
  let completed = 0;

  await runWithConcurrency(fileEntries, READ_CONCURRENCY, async (entry) => {
    const file = await readFileEntry(entry);
    if (file) {
      files.push(file);
    }
    completed += 1;
    options.onProgress?.(completed, fileEntries.length);
  });

  return files;
}