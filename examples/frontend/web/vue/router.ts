import { createRouter, createWebHistory } from 'vue-router'
import type { Role } from '../shared/model'
import { session } from './session'

// #region guard
declare module 'vue-router' {
  interface RouteMeta {
    role?: Role
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/dashboard', component: () => import('./StatusList.vue') },
    { path: '/projects/new', component: () => import('./ProjectForm.vue'), meta: { role: 'Admin' } },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

// One global guard reads each route's meta; returning a path redirects.
router.beforeEach((to) => {
  if (to.meta.role && session.role !== to.meta.role) return '/dashboard'
})
// #endregion
