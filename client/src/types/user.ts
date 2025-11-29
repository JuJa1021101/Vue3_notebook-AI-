// 用户相关类型定义

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar_url?: string
  nickname?: string
  bio?: string
  location?: string
  tier?: 'free' | 'basic' | 'premium' | 'enterprise'
  is_subscribed?: boolean
  subscription_expiry?: string
  last_login_at?: string
  login_count?: number
  is_active?: boolean
  created_at: string
  updated_at?: string
}

export interface UserProfile extends User {
  stats: UserStats
  preferences: UserPreferences
}

export interface UserStats {
  totalNotes: number
  totalCategories: number
  totalWords: number
  totalImages: number
  joinDays: number
  streakDays: number
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: 'small' | 'medium' | 'large'
  autoSave: boolean
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  reminder: boolean
  weeklyReport: boolean
}

export interface PrivacySettings {
  profileVisible: boolean
  allowSearch: boolean
  dataSync: boolean
}

export interface LoginRequest {
  username: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  verificationCode: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface UpdateProfileRequest {
  nickname?: string
  bio?: string
  location?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}