import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import { 
  MessageSquare, 
  FolderOpen, 
  Terminal, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react'

const Sidebar = ({ isOpen, onToggle, currentView, onViewChange }) => {
  const { logout, user } = useAuth()
  const { projects, currentProject, selectProject, deleteProject, createProject } = useProject()

  const menuItems = [
    { id: 'chat', label: '聊天', icon: MessageSquare },
    { id: 'files', label: '文件', icon: FolderOpen },
    { id: 'terminal', label: '终端', icon: Terminal },
    { id: 'settings', label: '设置', icon: Settings },
  ]

  const handleProjectSelect = async (projectPath) => {
    await selectProject(projectPath)
  }

  const handleProjectDelete = async (projectPath, e) => {
    e.stopPropagation()
    if (confirm('确定要删除这个项目吗？')) {
      await deleteProject(projectPath)
    }
  }

  const handleCreateProject = async () => {
    const projectName = prompt('请输入项目名称:')
    if (projectName && projectName.trim()) {
      console.log('Creating project:', { name: projectName.trim() })
      const result = await createProject(projectName.trim(), '')
      console.log('Create project result:', result)
      if (result.success) {
        alert('项目创建成功！')
      } else {
        alert(`项目创建失败: ${result.error}`)
      }
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {isOpen && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Qwen Code
              </h2>
            )}
            <button
              onClick={onToggle}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={`w-full sidebar-item ${
                      currentView === item.id ? 'active' : ''
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {isOpen && (
                      <span className="ml-3">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* 项目列表 */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                项目
              </h3>
              <button 
                onClick={handleCreateProject}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="创建新项目"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.path}
                  onClick={() => handleProjectSelect(project.path)}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    currentProject?.path === project.path
                      ? 'bg-qwen-100 dark:bg-qwen-900 text-qwen-700 dark:text-qwen-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {project.path}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleProjectDelete(project.path, e)}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  已登录
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-qwen-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar 