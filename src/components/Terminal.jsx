import React, { useState, useRef, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { Play, Stop, Trash2 } from 'lucide-react'

const Terminal = () => {
  const { currentProject } = useProject()
  const [output, setOutput] = useState([])
  const [input, setInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')
  const outputRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [output])

  const scrollToBottom = () => {
    outputRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const executeCommand = async (command) => {
    if (!command.trim() || !currentProject) return

    const commandOutput = {
      type: 'command',
      content: `$ ${command}`,
      timestamp: new Date()
    }

    setOutput(prev => [...prev, commandOutput])
    setCurrentCommand(command)
    setIsRunning(true)

    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          projectPath: currentProject.path
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const resultOutput = {
          type: 'output',
          content: data.output,
          timestamp: new Date()
        }
        setOutput(prev => [...prev, resultOutput])
      } else {
        const errorOutput = {
          type: 'error',
          content: '命令执行失败',
          timestamp: new Date()
        }
        setOutput(prev => [...prev, errorOutput])
      }
    } catch (error) {
      const errorOutput = {
        type: 'error',
        content: '网络错误，请稍后重试',
        timestamp: new Date()
      }
      setOutput(prev => [...prev, errorOutput])
    } finally {
      setIsRunning(false)
      setCurrentCommand('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isRunning) {
      executeCommand(input)
      setInput('')
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  const stopCommand = async () => {
    if (!isRunning) return

    try {
      await fetch('/api/terminal/stop', {
        method: 'POST',
      })
      setIsRunning(false)
      setCurrentCommand('')
    } catch (error) {
      console.error('Failed to stop command:', error)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        请先选择一个项目
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono">
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
          {isRunning && (
            <button
              onClick={stopCommand}
              className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              title="停止命令"
            >
              <Stop size={16} />
            </button>
          )}
          <button
            onClick={clearOutput}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white"
            title="清空输出"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 终端输出 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {output.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>终端已就绪</p>
            <p className="text-sm mt-2">输入命令开始执行</p>
          </div>
        ) : (
          output.map((item, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-gray-500 text-xs flex-shrink-0">
                [{formatTimestamp(item.timestamp)}]
              </span>
              <div className={`flex-1 ${
                item.type === 'error' ? 'text-red-400' : 
                item.type === 'command' ? 'text-yellow-400' : 
                'text-green-400'
              }`}>
                <pre className="whitespace-pre-wrap break-words">
                  {item.content}
                </pre>
              </div>
            </div>
          ))
        )}
        
        {isRunning && (
          <div className="flex items-center space-x-2 text-yellow-400">
            <div className="animate-pulse">●</div>
            <span>正在执行: {currentCommand}</span>
          </div>
        )}
        
        <div ref={outputRef} />
      </div>

      {/* 命令输入 */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入命令..."
            className="flex-1 bg-transparent text-green-400 outline-none border-none"
            disabled={isRunning}
          />
          <button
            type="submit"
            disabled={!input.trim() || isRunning}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded"
          >
            <Play size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Terminal 