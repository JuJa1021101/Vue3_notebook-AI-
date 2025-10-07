import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface Note {
  id: number
  user_id: number
  title: string
  content: string
  content_text: string
  category_id: number
  thumbnail_url?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: string
    icon: string
    color: string
  }
  tags?: Array<{
    id: number
    name: string
  }>
}

export interface CreateNoteRequest {
  title: string
  content: string
  category_id: number
  tags?: string[]
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  category_id?: number
  tags?: string[]
}

export interface GetNotesParams {
  page?: number
  limit?: number
  category_id?: number
  tag_id?: number
  search?: string
  sort_by?: 'created_at' | 'updated_at' | 'title'
  sort_order?: 'ASC' | 'DESC'
}

export interface NotesResponse {
  notes: Note[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 获取笔记列表
 */
export const getNotes = (params?: GetNotesParams) => {
  return request.get<ApiResponse<NotesResponse>>('/notes', { params })
}

/**
 * 获取笔记详情
 */
export const getNoteById = (id: number) => {
  return request.get<ApiResponse<Note>>(`/notes/${id}`)
}

/**
 * 创建笔记
 */
export const createNote = (data: CreateNoteRequest) => {
  return request.post<ApiResponse<Note>>('/notes', data)
}

/**
 * 更新笔记
 */
export const updateNote = (id: number, data: UpdateNoteRequest) => {
  return request.put<ApiResponse<Note>>(`/notes/${id}`, data)
}

/**
 * 删除笔记（软删除）
 */
export const deleteNote = (id: number) => {
  return request.delete<ApiResponse<null>>(`/notes/${id}`)
}

/**
 * 获取已删除的笔记（回收站）
 */
export const getDeletedNotes = () => {
  return request.get<ApiResponse<Note[]>>('/notes/trash')
}

/**
 * 还原笔记
 */
export const restoreNote = (id: number) => {
  return request.post<ApiResponse<null>>(`/notes/${id}/restore`)
}

/**
 * 彻底删除笔记（永久删除）
 */
export const permanentlyDeleteNotes = (ids: number[]) => {
  return request.post<ApiResponse<null>>('/notes/permanently-delete', { ids })
}

/**
 * 搜索笔记
 */
export const searchNotes = (params: {
  q: string
  type?: 'all' | 'title' | 'content'
  page?: number
  limit?: number
  category_id?: number
  tag_id?: number
}) => {
  return request.get<ApiResponse<NotesResponse>>('/search', { params })
}

/**
 * 获取热门标签
 */
export const getPopularTags = (limit?: number) => {
  return request.get<ApiResponse<Array<{ id: number; name: string; note_count: number }>>>('/tags/popular', {
    params: { limit }
  })
}

/**
 * 获取所有标签
 */
export const getAllTags = () => {
  return request.get<ApiResponse<Array<{ id: number; name: string }>>>('/tags')
}

/**
 * 获取用户统计数据
 */
export interface UserStatsResponse {
  totalNotes: number
  totalCategories: number
  totalWords: number
}

export const getUserStats = () => {
  return request.get<ApiResponse<UserStatsResponse>>('/notes/stats')
}
