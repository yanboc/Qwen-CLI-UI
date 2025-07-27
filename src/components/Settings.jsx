import React, { useState, useEffect } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    apiKey: '',
    baseUrl: '',
    model: 'qwen3-coder-plus',
    theme: 'light',
    fontSize: 14,
    enableAutoSave: true,
    enableNotifications: true,
    maxHistoryLength: 100
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('qwen_code_token')
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('qwen_code_token')
      console.log('Token:', token ? '存在' : '不存在')
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        setMessage('设置已保存')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`保存失败: ${responseData.error || '未知错误'}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage(`网络错误: ${error.message}`)
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const models = [
    { value: 'qwen3-coder-plus', label: 'Qwen3-Coder-Plus (推荐)' },
    { value: 'qwen3-coder-480b-a35b-instruct', label: 'Qwen3-Coder-480B-A35B-Instruct' },
    { value: 'qwen3-coder-480a35', label: 'Qwen3-Coder-480A35' }
  ]

  const baseUrls = [
    { value: 'https://dashscope.aliyuncs.com/compatible-mode/v1', label: '阿里云 Bailian (中国大陆)' },
    { value: 'https://api-inference.modelscope.cn/v1', label: 'ModelScope (中国大陆，每日2000次免费)' },
    { value: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', label: '阿里云 ModelStudio (海外)' }
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 设置头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          设置
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          配置 Qwen Code UI 的个性化设置
        </p>
      </div>

      {/* 设置内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* API 配置 */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              API 配置
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-qwen-500 focus:border-transparent"
                    placeholder="输入您的 Qwen API Key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  请前往阿里云控制台获取 API Key
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API 基础 URL
                </label>
                <select
                  value={settings.baseUrl}
                  onChange={(e) => handleChange('baseUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-qwen-500 focus:border-transparent"
                >
                  <option value="">选择 API 端点</option>
                  {baseUrls.map((url) => (
                    <option key={url.value} value={url.value}>
                      {url.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  模型选择
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-qwen-500 focus:border-transparent"
                >
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 界面设置 */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              界面设置
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  主题
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-qwen-500 focus:border-transparent"
                >
                  <option value="light">浅色主题</option>
                  <option value="dark">深色主题</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体大小
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>10px</span>
                  <span>{settings.fontSize}px</span>
                  <span>20px</span>
                </div>
              </div>
            </div>
          </div>

          {/* 功能设置 */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              功能设置
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    自动保存
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    自动保存文件更改
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAutoSave}
                    onChange={(e) => handleChange('enableAutoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-qwen-300 dark:peer-focus:ring-qwen-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-qwen-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    通知提醒
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    显示操作完成通知
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-qwen-300 dark:peer-focus:ring-qwen-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-qwen-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  历史记录长度
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={settings.maxHistoryLength}
                  onChange={(e) => handleChange('maxHistoryLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-qwen-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  保存的聊天记录最大条数
                </p>
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex items-center justify-between">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              <span className="ml-2">保存设置</span>
            </button>
            
            {message && (
              <span className={`text-sm ${
                message.includes('成功') || message.includes('保存') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 