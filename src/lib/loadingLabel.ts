import type { LoadingProgress } from '../types';

/**
 * Note: once `loading` is true, `progress` (if present) is always assumed to
 * be mid-flight — the 'reading'/'parsing' branches below don't re-check
 * `loading`, they rely on the early return above having already handled the
 * not-loading case.
 */
export function getLoadingLabel(progress: LoadingProgress | null, loading: boolean): string {
  if (!loading) return 'Open Folder';
  if (!progress) return 'Analyzing...';

  if (progress.phase === 'reading') {
    if (progress.total === 0) return 'Scanning files...';
    return `Reading ${progress.current}/${progress.total} files...`;
  }
  if (progress.phase === 'parsing') return 'Parsing imports...';
  return 'Building graph...';
}