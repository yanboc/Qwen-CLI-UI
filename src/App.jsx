import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ProjectProvider } from './contexts/ProjectContext'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import FileExplorer from './components/FileExplorer'
import Settings from './components/Settings'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return <Chat />
      case 'files':
        return <FileExplorer />
      case 'terminal':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                终端
              </h1>
              <p className="text-gray-600 mb-4">
                请先在文件浏览器中选择一个项目
              </p>
              <button 
                onClick={() => setActiveTab('files')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                去选择项目
              </button>
            </div>
          </div>
        )
      case 'settings':
        return <Settings />
      default:
        return <Chat />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={activeTab}
        onViewChange={setActiveTab}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App 