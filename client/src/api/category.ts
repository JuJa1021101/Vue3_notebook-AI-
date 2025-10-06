import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface Category {
  id: number
  user_id: number
  name: string
  icon: string
  color: string
  note_count: number
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
  icon?: string
  color?: string
}

export interface UpdateCategoryRequest {
  name?: string
  icon?: string
  color?: string
}

/**
 * 获取分类列表
 */
export const getCategories = () => {
  return request.get<ApiResponse<Category[]>>('/categories')
}

/**
 * 获取分类详情
 */
export const getCategoryById = (id: number) => {
  return request.get<ApiResponse<Category>>(`/categories/${id}`)
}

/**
 * 创建分类
 */
export const createCategory = (data: CreateCategoryRequest) => {
  return request.post<ApiResponse<Category>>('/categories', data)
}

/**
 * 更新分类
 */
export const updateCategory = (id: number, data: UpdateCategoryRequest) => {
  return request.put<ApiResponse<Category>>(`/categories/${id}`, data)
}

/**
 * 删除分类
 */
export const deleteCategory = (id: number) => {
  return request.delete<ApiResponse<{ id: number; message: string }>>(`/categories/${id}`)
}

/**
 * 获取分类统计
 */
export const getCategoryStats = () => {
  return request.get<ApiResponse<{
    total_categories: number
    categories_with_notes: number
    total_notes: number
    categories: Category[]
  }>>('/categories/stats')
}
