import { useEffect, useRef } from 'react';
import { useNodesInitialized } from '@xyflow/react';

/**
 * Runs `onRelayout` exactly once per mount, as soon as React Flow reports
 * every node has been measured for the first time. This replaces the
 * line-count-based initial layout with one based on real rendered size.
 */
export function useAutoLayoutOnMeasure(nodeCount: number, onRelayout: () => void) {
  const nodesInitialized = useNodesInitialized();
  const hasAutoLaidOut = useRef(false);

  useEffect(() => {
    if (nodesInitialized && nodeCount > 0 && !hasAutoLaidOut.current) {
      hasAutoLaidOut.current = true;
      onRelayout();
    }
  }, [nodesInitialized, nodeCount, onRelayout]);
}