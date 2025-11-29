// 笔记相关类型定义

export interface Note {
  id: string
  title: string
  content: string
  categoryId: string
  categoryName: string
  categoryColor: string
  tags: string[]
  createdAt: string
  updatedAt: string
  imageUrl?: string
  isStarred?: boolean
  isDeleted?: boolean
  is_favorited?: boolean
  is_pinned?: boolean
  view_count?: number
  word_count?: number
  last_viewed_at?: string
  visibility?: 'private' | 'public' | 'shared'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  status?: 'draft' | 'published' | 'archived'
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  noteCount: number
  createdAt: string
  updatedAt: string
  description?: string
  sort_order?: number
  is_default?: boolean
  note_count?: number
}

export interface CreateNoteRequest {
  title: string
  content: string
  categoryId: string
  tags: string[]
}

export interface UpdateNoteRequest {
  id: string
  title?: string
  content?: string
  categoryId?: string
  tags?: string[]
}

export interface NoteFilter {
  categoryId?: string
  tags?: string[]
  keyword?: string
  isStarred?: boolean
  startDate?: string
  endDate?: string
}

export interface NotesResponse {
  notes: Note[]
  total: number
  page: number
  pageSize: number
}