import { useCallback, useState } from 'react';
import { addEdge, type Connection, type Edge } from '@xyflow/react';
import { Sidebar } from './components/Sidebar';
import { GraphCanvas } from './components/GraphCanvas';
import { SyntaxThemeProvider } from './hooks/useSyntaxTheme';
import { useWorkspace } from './hooks/useWorkspace';
import type { UiMode } from './types';

export default function App() {
  const [uiMode, setUiMode] = useState<UiMode>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [focusNodePath, setFocusNodePath] = useState<string | null>(null);

  const workspace = useWorkspace();

  const onConnect = useCallback(
    (connection: Edge | Connection) => workspace.setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [workspace],
  );

  const handleFileSelect = useCallback((filePath: string) => {
    setFocusNodePath(filePath);
  }, []);

  return (
    <SyntaxThemeProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans">
        <Sidebar
          uiMode={uiMode}
          onUiModeChange={setUiMode}
          directoryName={workspace.directoryName}
          files={workspace.files}
          loading={workspace.loading}
          loadingProgress={workspace.loadingProgress}
          isOpen={isSidebarOpen}
          onOpenFolder={workspace.openFolder}
          onFileSelect={handleFileSelect}
        />
        <GraphCanvas
          nodes={workspace.nodes}
          edges={workspace.edges}
          onNodesChange={workspace.onNodesChange}
          onEdgesChange={workspace.onEdgesChange}
          onConnect={onConnect}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((value) => !value)}
          showEmptyState={!workspace.directoryName && !workspace.loading}
          onLoadSample={workspace.loadSampleData}
          focusNodePath={focusNodePath}
          onFocusComplete={() => setFocusNodePath(null)}
        />
      </div>
    </SyntaxThemeProvider>
  );
}
