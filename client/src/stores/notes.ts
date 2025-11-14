/**
 * Notes Store - 统一管理笔记状态
 */

import { defineStore } from 'pinia';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getDeletedNotes,
  restoreNote,
  permanentlyDeleteNotes,
  searchNotes,
  type Note,
  type CreateNoteRequest,
  type UpdateNoteRequest,
  type GetNotesParams,
  type NotesResponse,
} from '@/api/note';
import cache from '@/utils/cache';

interface NotesState {
  // 笔记列表
  notes: Note[];
  // 当前笔记
  currentNote: Note | null;
  // 回收站笔记
  trashedNotes: Note[];
  // 分页信息
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
  // 筛选条件
  filters: {
    categoryId?: number;
    tagId?: number;
    search?: string;
    sortBy: 'created_at' | 'updated_at' | 'title';
    sortOrder: 'ASC' | 'DESC';
  };
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
    currentNote: null,
    trashedNotes: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
    filters: {
      sortBy: 'updated_at',
      sortOrder: 'DESC',
    },
  }),

  getters: {
    /**
     * 获取指定分类的笔记
     */
    getNotesByCategory: (state) => (categoryId: number) => {
      return state.notes.filter((note) => note.category_id === categoryId);
    },

    /**
     * 获取指定标签的笔记
     */
    getNotesByTag: (state) => (tagId: number) => {
      return state.notes.filter((note) =>
        note.tags?.some((tag) => tag.id === tagId)
      );
    },

    /**
     * 获取最近更新的笔记
     */
    recentNotes: (state) => {
      return [...state.notes]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);
    },

    /**
     * 笔记总数
     */
    totalNotes: (state) => state.pagination.total,

    /**
     * 是否有更多笔记
     */
    hasMore: (state) => state.pagination.page < state.pagination.totalPages,
  },

  actions: {
    /**
     * 获取笔记列表
     */
    async fetchNotes(params?: GetNotesParams) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = {
          ...this.filters,
          ...params,
          page: params?.page || this.pagination.page,
          limit: params?.limit || this.pagination.limit,
        };

        // 尝试从缓存获取
        const cacheKey = `notes:${JSON.stringify(queryParams)}`;
        const cachedData = cache.get<NotesResponse>(cacheKey);

        if (cachedData) {
          this.notes = cachedData.notes;
          this.pagination = {
            page: cachedData.page,
            limit: cachedData.limit,
            total: cachedData.total,
            totalPages: cachedData.totalPages,
          };
          this.loading = false;
          return;
        }

        const response = await getNotes(queryParams);

        if (response.data.success) {
          const data = response.data.data as NotesResponse;
          this.notes = data.notes;
          this.pagination = {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages,
          };

          // 存入缓存（2分钟）
          cache.set(cacheKey, data, 2 * 60 * 1000);
        } else {
          this.error = response.data.message || '获取笔记列表失败';
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('获取笔记列表失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 加载更多笔记（分页）
     */
    async loadMore() {
      if (!this.hasMore || this.loading) return;

      const nextPage = this.pagination.page + 1;
      this.loading = true;

      try {
        const response = await getNotes({
          ...this.filters,
          page: nextPage,
          limit: this.pagination.limit,
        });

        if (response.data.success) {
          const data = response.data.data as NotesResponse;
          this.notes.push(...data.notes);
          this.pagination = {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages,
          };
        }
      } catch (error: any) {
        this.error = error.message || '加载更多失败';
        console.error('加载更多笔记失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取笔记详情
     */
    async fetchNoteById(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await getNoteById(id);

        if (response.data.success) {
          this.currentNote = response.data.data as Note;
          return this.currentNote;
        } else {
          this.error = response.data.message || '获取笔记详情失败';
          return null;
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('获取笔记详情失败:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建笔记
     */
    async createNote(data: CreateNoteRequest) {
      this.loading = true;
      this.error = null;

      try {
        const response = await createNote(data);

        if (response.data.success) {
          const newNote = response.data.data as Note;
          this.notes.unshift(newNote);
          this.pagination.total += 1;

          // 清除笔记列表缓存
          this.clearNotesCache();

          return newNote;
        } else {
          this.error = response.data.message || '创建笔记失败';
          return null;
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('创建笔记失败:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新笔记
     */
    async updateNote(id: number, data: UpdateNoteRequest) {
      this.loading = true;
      this.error = null;

      try {
        const response = await updateNote(id, data);

        if (response.data.success) {
          const updatedNote = response.data.data as Note;

          // 更新列表中的笔记
          const index = this.notes.findIndex((note) => note.id === id);
          if (index !== -1) {
            this.notes[index] = updatedNote;
          }

          // 更新当前笔记
          if (this.currentNote?.id === id) {
            this.currentNote = updatedNote;
          }

          return updatedNote;
        } else {
          this.error = response.data.message || '更新笔记失败';
          return null;
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('更新笔记失败:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 删除笔记（软删除）
     */
    async deleteNote(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await deleteNote(id);

        if (response.data.success) {
          // 从列表中移除
          this.notes = this.notes.filter((note) => note.id !== id);
          this.pagination.total -= 1;

          // 清除当前笔记
          if (this.currentNote?.id === id) {
            this.currentNote = null;
          }

          return true;
        } else {
          this.error = response.data.message || '删除笔记失败';
          return false;
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('删除笔记失败:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取回收站笔记
     */
    async fetchTrashedNotes() {
      this.loading = true;
      this.error = null;

      try {
        const response = await getDeletedNotes();

        if (response.data.success) {
          this.trashedNotes = response.data.data as Note[];
        } else {
          this.error = response.data.message || '获取回收站笔记失败';
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('获取回收站笔记失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 还原笔记
     */
    async restoreNote(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await restoreNote(id);

        if (response.data.success) {
          // 从回收站移除
          this.trashedNotes = this.trashedNotes.filter((note) => note.id !== id);
          // 重新加载笔记列表
          await this.fetchNotes();
          return true;
        } else {
          this.error = response.data.message || '还原笔记失败';
          return false;
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('还原笔记失败:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 永久删除笔记
     */
    async permanentlyDeleteNotes(ids: number[]) {
      this.loading = true;
      this.error = null;

      try {
        const response = await permanentlyDeleteNotes(ids);

        if (response.data.success) {
          // 从回收站移除
          this.trashedNotes = this.trashedNotes.filter((note) => !ids.includes(note.id));
          return true;
        } else {
          this.error = response.data.message || '永久删除笔记失败';
          return false;
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('永久删除笔记失败:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 搜索笔记
     */
    async searchNotes(query: string, options?: {
      type?: 'all' | 'title' | 'content';
      categoryId?: number;
      tagId?: number;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const response = await searchNotes({
          q: query,
          type: options?.type || 'all',
          category_id: options?.categoryId,
          tag_id: options?.tagId,
          page: 1,
          limit: 50,
        });

        if (response.data.success) {
          const data = response.data.data as NotesResponse;
          this.notes = data.notes;
          this.pagination = {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages,
          };
        } else {
          this.error = response.data.message || '搜索笔记失败';
        }
      } catch (error: any) {
        this.error = error.message || '网络错误';
        console.error('搜索笔记失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters: Partial<NotesState['filters']>) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // 重置页码
    },

    /**
     * 清除筛选条件
     */
    clearFilters() {
      this.filters = {
        sortBy: 'updated_at',
        sortOrder: 'DESC',
      };
      this.pagination.page = 1;
    },

    /**
     * 设置当前笔记
     */
    setCurrentNote(note: Note | null) {
      this.currentNote = note;
    },

    /**
     * 清除错误
     */
    clearError() {
      this.error = null;
    },

    /**
     * 清除笔记列表缓存
     */
    clearNotesCache() {
      // 清除所有以 'notes:' 开头的缓存
      cache.clear();
    },

    /**
     * 重置状态
     */
    reset() {
      this.notes = [];
      this.currentNote = null;
      this.trashedNotes = [];
      this.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      this.loading = false;
      this.error = null;
      this.clearFilters();
      this.clearNotesCache();
    },
  },
});
