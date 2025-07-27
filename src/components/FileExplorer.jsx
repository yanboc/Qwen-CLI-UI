import React, { useState, useEffect } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { Folder, File, ChevronRight, ChevronDown, Edit, Save, X } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { go } from '@codemirror/lang-go'
import { php } from '@codemirror/lang-php'
import { sql } from '@codemirror/lang-sql'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'

const FileExplorer = () => {
  const { currentProject } = useProject()
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentProject) {
      loadFiles()
    }
  }, [currentProject])

  const loadFiles = async () => {
    if (!currentProject) return
    
    console.log('Loading files for project:', currentProject)
    setLoading(true)
    try {
      const token = localStorage.getItem('qwen_code_token')
      console.log('Token:', token ? 'exists' : 'missing')
      
      // 使用完整的URL
      const apiUrl = `${window.location.protocol}//${window.location.hostname}:4008/api/files?path=${encodeURIComponent(currentProject.path)}`
      console.log('API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Files API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Files data:', data)
        setFiles(data.files)
      } else {
        const errorText = await response.text()
        console.error('Files API error:', errorText)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFileContent = async (filePath) => {
    try {
      const token = localStorage.getItem('qwen_code_token')
      const apiUrl = `${window.location.protocol}//${window.location.hostname}:4008/api/files/content?path=${encodeURIComponent(filePath)}`
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFileContent(data.content)
        setSelectedFile(filePath)
      }
    } catch (error) {
      console.error('Failed to load file content:', error)
    }
  }

  const saveFile = async () => {
    if (!selectedFile) return

    try {
      const token = localStorage.getItem('qwen_code_token')
      const apiUrl = `${window.location.protocol}//${window.location.hostname}:4008/api/files/save`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          path: selectedFile,
          content: fileContent
        }),
      })

      if (response.ok) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return <File size={16} className="text-blue-500" />
  }

  const getLanguageExtension = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return javascript()
      case 'py':
        return python()
      case 'java':
        return java()
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'h':
      case 'hpp':
        return cpp()
      case 'rs':
        return rust()
      case 'go':
        return go()
      case 'php':
        return php()
      case 'sql':
        return sql()
      case 'html':
      case 'htm':
        return html()
      case 'css':
      case 'scss':
      case 'sass':
        return css()
      case 'json':
        return json()
      case 'md':
      case 'markdown':
        return markdown()
      default:
        return null
    }
  }

  const renderFileTree = (fileList, level = 0) => {
    return fileList.map((file) => {
      const isExpanded = expandedFolders.has(file.path)
      const isSelected = selectedFile === file.path
      
      if (file.type === 'directory') {
        return (
          <div key={file.path}>
            <div
              className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isSelected ? 'bg-qwen-100 dark:bg-qwen-900' : ''
              }`}
              style={{ paddingLeft: `${level * 20 + 8}px` }}
              onClick={() => toggleFolder(file.path)}
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
              <Folder size={16} className="text-yellow-500 ml-1" />
              <span className="ml-2 text-sm">{file.name}</span>
            </div>
            {isExpanded && file.children && (
              <div>{renderFileTree(file.children, level + 1)}</div>
            )}
          </div>
        )
      } else {
        return (
          <div
            key={file.path}
            className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isSelected ? 'bg-qwen-100 dark:bg-qwen-900' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => loadFileContent(file.path)}
          >
            {getFileIcon(file.name)}
            <span className="ml-2 text-sm">{file.name}</span>
          </div>
        )
      }
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
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* 文件树 */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            文件浏览器
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentProject.name}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-qwen-600"></div>
            </div>
          ) : (
            <div className="py-2">
              {renderFileTree(files)}
            </div>
          )}
        </div>
      </div>

      {/* 文件编辑器 */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile.split('/').pop()}
                </h3>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveFile}
                        className="btn-primary"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <CodeMirror
                value={fileContent}
                onChange={setFileContent}
                extensions={[getLanguageExtension(selectedFile)].filter(Boolean)}
                theme="dark"
                readOnly={!isEditing}
                className="h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            选择一个文件开始编辑
          </div>
        )}
      </div>
    </div>
  )
}

export default FileExplorer 