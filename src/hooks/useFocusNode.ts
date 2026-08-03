import { useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

/**
 * Centers the viewport on the node matching `focusNodePath` (e.g. when a
 * file is picked from the sidebar), then calls `onFocusComplete` so the
 * caller can clear the pending focus request.
 */
export function useFocusNode(focusNodePath: string | null, onFocusComplete: () => void) {
  const { setCenter, getNode } = useReactFlow();
  const lastFocusedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!focusNodePath || focusNodePath === lastFocusedPath.current) return;

    const node = getNode(focusNodePath);
    if (!node) {
      onFocusComplete();
      return;
    }

    lastFocusedPath.current = focusNodePath;
    const width = node.measured?.width ?? 400;
    const height = node.measured?.height ?? 200;
    setCenter(node.position.x + width / 2, node.position.y + height / 2, { zoom: 0.8, duration: 400 });
    onFocusComplete();
  }, [focusNodePath, getNode, onFocusComplete, setCenter]);
}