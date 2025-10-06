import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/views/auth/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue')
      }
    ]
  },
  {
    path: '/',
    redirect: '/auth/login'
  },
  {
    path: '/main',
    component: () => import('@/views/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/main/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/HomeView.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/category/CategoryView.vue')
      },
      {
        path: 'notes/new',
        name: 'NoteCreate',
        component: () => import('@/views/note/NoteEditView.vue')
      },
      {
        path: 'notes/:id',
        name: 'NoteDetail',
        component: () => import('@/views/note/NoteDetailView.vue')
      },
      {
        path: 'notes/:id/edit',
        name: 'NoteEdit',
        component: () => import('@/views/note/NoteEditView.vue')
      },
      {
        path: 'notes',
        name: 'NoteList',
        component: () => import('@/views/note/NoteListView.vue')
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/search/SearchView.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router