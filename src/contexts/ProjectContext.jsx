import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'

const ProjectContext = createContext()

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const { socket, connected, on, emit } = useSocket()

  useEffect(() => {
    if (connected) {
      loadProjects()
    }
  }, [connected])

  useEffect(() => {
    if (socket) {
      on('projects_updated', handleProjectsUpdate)
      on('project_selected', handleProjectSelected)
      
      return () => {
        socket.off('projects_updated', handleProjectsUpdate)
        socket.off('project_selected', handleProjectSelected)
      }
    }
  }, [socket])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectsUpdate = (data) => {
    setProjects(data.projects)
  }

  const handleProjectSelected = (data) => {
    setCurrentProject(data.project)
  }

  const selectProject = async (projectPath) => {
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/projects/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ path: projectPath }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentProject(data.project)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  const createProject = async (name, path) => {
    try {
      const token = localStorage.getItem('qwen_code_token')
      console.log('Creating project with token:', token ? 'exists' : 'missing')
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, path }),
      })

      console.log('Create project response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Create project success:', data)
        await loadProjects()
        return { success: true }
      } else {
        const error = await response.json()
        console.log('Create project error:', error)
        return { success: false, error: error.error || error.message || '未知错误' }
      }
    } catch (error) {
      console.error('Create project exception:', error)
      return { success: false, error: error.message || '网络错误，请稍后重试' }
    }
  }

  const deleteProject = async (projectPath) => {
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch(`/api/projects/${encodeURIComponent(projectPath)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadProjects()
        if (currentProject?.path === projectPath) {
          setCurrentProject(null)
        }
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  const value = {
    projects,
    currentProject,
    loading,
    selectProject,
    createProject,
    deleteProject,
    loadProjects,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
} 