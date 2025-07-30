import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { ProjectProvider } from './contexts/ProjectContext'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import FileExplorer from './components/FileExplorer'
import Terminal from './components/Terminal'
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

  // 修改：使用显示/隐藏控制，而不是条件渲染
  const renderActiveTab = () => {
    return (
      <div className="h-full">
        {/* 聊天组件 */}
        <div className={`h-full ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
          <Chat />
        </div>
        
        {/* 文件浏览器组件 */}
        <div className={`h-full ${activeTab === 'files' ? 'block' : 'hidden'}`}>
          <FileExplorer />
        </div>
        
        {/* 终端组件 - 始终存在，只控制显示/隐藏 */}
        <div className={`h-full ${activeTab === 'terminal' ? 'block' : 'hidden'}`}>
          <Terminal />
        </div>
        
        {/* 设置组件 */}
        <div className={`h-full ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
          <Settings />
        </div>
      </div>
    )
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