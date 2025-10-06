// API相关类型定义

export interface ApiResponse<T = any> {
  code: number
  success: boolean
  message: string
  data: T
  timestamp?: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  code: number
  message: string
  details?: any
}

export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

export interface SearchParams {
  keyword?: string
  categoryId?: string
  tags?: string[]
  startDate?: string
  endDate?: string
  isStarred?: boolean
  isDeleted?: boolean
}

export interface BatchOperation {
  action: 'delete' | 'star' | 'unstar' | 'move' | 'tag'
  noteIds: string[]
  params?: any
}

export interface SyncStatus {
  lastSyncAt: string
  pendingChanges: number
  conflictCount: number
  isOnline: boolean
}

export interface BackupInfo {
  id: string
  createdAt: string
  size: number
  noteCount: number
  categoryCount: number
  isAutoBackup: boolean
}

export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf' | 'html'
  includeImages: boolean
  includeDeleted: boolean
  categoryIds?: string[]
  dateRange?: {
    start: string
    end: string
  }
}