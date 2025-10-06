import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authApi from '@/api/auth'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = ref<boolean>(!!localStorage.getItem('token'))
  const isLoading = ref<boolean>(false)

  // 登录
  const login = async (credentials: { username: string; password: string }) => {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)

      if (response.data.code === 200 && response.data.data) {
        user.value = response.data.data.user
        token.value = response.data.data.token
        isAuthenticated.value = true

        // 保存到 localStorage
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))

        console.log('登录成功，用户信息:', user.value)
      } else {
        throw new Error(response.data.message || '登录失败')
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (userData: {
    username: string
    email: string
    password: string
    phone?: string
    confirmPassword?: string
  }) => {
    isLoading.value = true
    try {
      const response = await authApi.register({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
        phone: userData.phone || ''
      })

      if (response.data.code === 201 && response.data.data) {
        user.value = response.data.data.user
        token.value = response.data.data.token
        isAuthenticated.value = true

        // 保存到 localStorage
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))

        console.log('注册成功，用户信息:', user.value)
      } else {
        throw new Error(response.data.message || '注册失败')
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      user.value = null
      token.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      console.log('fetchUserProfile: 开始获取用户信息...')
      const response = await authApi.getProfile()
      console.log('fetchUserProfile: API响应:', response)

      if (response.data.code === 200 && response.data.data) {
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
        console.log('fetchUserProfile: 用户信息已更新:', user.value)
      } else {
        console.error('fetchUserProfile: 响应码不是200:', response)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 刷新令牌
  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken()

      if (response.data.code === 200 && response.data.data) {
        token.value = response.data.data.token
        localStorage.setItem('token', response.data.data.token)
      }
    } catch (error) {
      console.error('刷新令牌失败:', error)
      throw error
    }
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (token.value) {
      try {
        await fetchUserProfile()
        isAuthenticated.value = true
      } catch (error) {
        console.error('令牌验证失败:', error)
        logout()
      }
    }
  }

  // 从 localStorage 恢复用户信息
  const restoreUser = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        console.log('从 localStorage 恢复用户信息:', user.value)
      } catch (error) {
        console.error('恢复用户信息失败:', error)
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchUserProfile,
    refreshToken,
    checkAuth,
    restoreUser
  }
})
