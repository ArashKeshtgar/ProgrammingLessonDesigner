import { createRouter, createWebHashHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'
import { getLesson } from '../lib/lessons'
import { BOOKLETS } from '../lib/booklets'
import { savedLang } from '../projects/i18n'

// Hash history keeps deep links working on GitHub Pages with no rewrite rules.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
    { path: '/booklet/:tag', name: 'booklet', component: () => import('../views/BookletView.vue') },
    { path: '/review', name: 'review', component: () => import('../views/ReviewView.vue') },
    // The Projects tab: the language is part of the address, so a link keeps it.
    { path: '/projects', redirect: () => `/projects/${savedLang()}` },
    { path: '/projects/:lang(fa|en)/:page?', name: 'projects', component: () => import('../views/projects/ProjectsView.vue') },
  ],
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
})

router.afterEach((to) => {
  const APP = 'Programming Lessons'
  let page = ''
  if (to.name === 'lesson') page = getLesson(String(to.params.id))?.en ?? ''
  if (to.name === 'booklet') page = `${BOOKLETS[String(to.params.tag)]?.title ?? to.params.tag} booklet`
  if (to.name === 'review') page = 'Review'
  if (to.name === 'projects') page = 'Projects' // ProjectsView puts the page's own name in front
  document.title = page ? `${page} · ${APP}` : `${APP} · درس‌های برنامه‌نویسی`
})

export default router
