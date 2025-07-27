import React, { useState, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { ExternalLink, RefreshCw } from 'lucide-react'

const Terminal = () => {
  const { currentProject } = useProject()
  const [ttydUrl, setTtydUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentProject) {
      // 启动ttyd服务并获取URL
      startTtydService()
    }
  }, [currentProject])

  const startTtydService = async () => {
    if (!currentProject) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/terminal/start-ttyd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectPath: currentProject.path
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTtydUrl(data.ttydUrl)
      } else {
        console.error('Failed to start ttyd service')
      }
    } catch (error) {
      console.error('Error starting ttyd service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTerminal = () => {
    startTtydService()
  }

  const openInNewTab = () => {
    if (ttydUrl) {
      window.open(ttydUrl, '_blank')
    }
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">请先选择一个项目</h3>
          <p className="text-sm">选择项目后即可使用终端功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* 终端头部 */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-white">
            终端
          </h2>
          <span className="text-sm text-gray-400">
            {currentProject.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshTerminal}
            disabled={isLoading}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white"
            title="刷新终端"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {ttydUrl && (
            <button
              onClick={openInNewTab}
              className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
              title="在新标签页中打开"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 终端内容 */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4" />
              <p>正在启动终端服务...</p>
            </div>
          </div>
        ) : ttydUrl ? (
          <iframe
            src={ttydUrl}
            className="w-full h-full border-0"
            title="Web Terminal"
            allow="fullscreen"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p>终端服务启动失败</p>
              <button
                onClick={refreshTerminal}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                重试
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Terminal 