import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 敏感字段列表（不在日志中显示）
const SENSITIVE_FIELDS = ['password', 'oldPassword', 'newPassword', 'confirmPassword', 'token', 'accessToken', 'refreshToken']

// 过滤敏感信息的函数
const filterSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data
  }

  // 如果是 FormData，不打印详细内容
  if (data instanceof FormData) {
    return '[FormData]'
  }

  // 深拷贝对象以避免修改原始数据
  const filtered = Array.isArray(data) ? [...data] : { ...data }

  // 遍历对象属性
  for (const key in filtered) {
    if (SENSITIVE_FIELDS.includes(key)) {
      // 敏感字段用 *** 替换
      filtered[key] = '***'
    } else if (typeof filtered[key] === 'object' && filtered[key] !== null) {
      // 递归处理嵌套对象
      filtered[key] = filterSensitiveData(filtered[key])
    }
  }

  return filtered
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 如果是 FormData，删除 Content-Type，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    // 调试：打印请求信息（过滤敏感数据）
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    if (!(config.data instanceof FormData)) {
      console.log('请求数据:', filterSensitiveData(config.data))
    }

    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 如果响应成功
    if (res.code === 200 || res.code === 201 || res.success === true) {
      return response
    }

    // 处理业务错误
    console.error('业务错误:', res.message)
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    console.error('响应错误:', error.message)
    console.error('错误详情:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    })

    // 处理401未授权 - 只在真正的认证失败时才重定向
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || ''
      // 只有在 token 无效或过期时才重定向
      if (errorMessage.includes('token') || errorMessage.includes('认证') || errorMessage.includes('登录')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
      }
    }

    // 提取错误信息
    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default request
