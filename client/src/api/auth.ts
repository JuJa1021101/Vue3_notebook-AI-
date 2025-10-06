import request from '@/utils/request'
import type { LoginRequest, RegisterRequest, LoginResponse, User, UpdateProfileRequest, ChangePasswordRequest } from '@/types/user'
import type { ApiResponse } from '@/types/api'

/**
 * 用户注册
 */
export const register = (data: Omit<RegisterRequest, 'verificationCode'>) => {
  return request.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
    username: data.username,
    email: data.email,
    password: data.password,
    phone: data.phone || '',
    nickname: data.username
  })
}

/**
 * 用户登录
 */
export const login = (data: LoginRequest) => {
  return request.post<ApiResponse<LoginResponse>>('/auth/login', {
    username: data.username,
    password: data.password
  })
}

/**
 * 用户登出
 */
export const logout = () => {
  return request.post<ApiResponse<null>>('/auth/logout')
}

/**
 * 获取用户信息
 */
export const getProfile = () => {
  return request.get<ApiResponse<User>>('/auth/profile')
}

/**
 * 更新用户信息
 */
export const updateProfile = (data: UpdateProfileRequest) => {
  return request.put<ApiResponse<User>>('/auth/profile', data)
}

/**
 * 修改密码
 */
export const changePassword = (data: ChangePasswordRequest) => {
  return request.put<ApiResponse<{ message: string }>>('/auth/password', {
    oldPassword: data.oldPassword,
    newPassword: data.newPassword
  })
}

/**
 * 刷新令牌
 */
export const refreshToken = () => {
  return request.post<ApiResponse<{ token: string }>>('/auth/refresh')
}
