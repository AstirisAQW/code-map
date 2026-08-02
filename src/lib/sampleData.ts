import type { FileNodeData } from '../types';

export const sampleFiles: FileNodeData[] = [
  {
    name: "main.tsx",
    path: "/src/main.tsx",
    language: "typescript",
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
  },
  {
    name: "App.tsx",
    path: "/src/App.tsx",
    language: "typescript",
    content: `import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user } = useAuth();
  
  return (
    <div className="layout">
      <Header user={user} />
      <div className="body">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}`
  },
  {
    name: "Header.tsx",
    path: "/src/components/Header.tsx",
    language: "typescript",
    content: `import { UserProfile } from './UserProfile';

export function Header({ user }: { user: any }) {
  return (
    <header className="header">
      <h1>My App</h1>
      <UserProfile user={user} />
    </header>
  );
}`
  },
  {
    name: "Sidebar.tsx",
    path: "/src/components/Sidebar.tsx",
    language: "typescript",
    content: `import { NavLinks } from './NavLinks';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLinks />
    </aside>
  );
}`
  },
  {
    name: "MainContent.tsx",
    path: "/src/components/MainContent.tsx",
    language: "typescript",
    content: `import { DataViewer } from './DataViewer';

export function MainContent() {
  return (
    <main className="main-content">
      <h2>Dashboard</h2>
      <DataViewer />
    </main>
  );
}`
  },
  {
    name: "useAuth.ts",
    path: "/src/hooks/useAuth.ts",
    language: "typescript",
    content: `import { useState, useEffect } from 'react';
import { fetchUser } from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  
  return { user };
}`
  },
  {
    name: "auth.ts",
    path: "/src/api/auth.ts",
    language: "typescript",
    content: `export async function fetchUser() {
  return { id: 1, name: "Alice" };
}`
  },
  {
    name: "index.css",
    path: "/src/index.css",
    language: "css",
    content: `.layout { display: flex; flex-direction: column; height: 100vh; }
.body { display: flex; flex: 1; }
.sidebar { width: 250px; background: #eee; }
.main-content { flex: 1; padding: 20px; }`
  }
];
