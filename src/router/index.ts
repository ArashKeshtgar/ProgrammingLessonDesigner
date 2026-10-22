import { createRouter, createWebHashHistory } from 'vue-router'
import LessonListView from '../views/LessonListView.vue'
import LessonView from '../views/LessonView.vue'
import { getLesson } from '../lib/lessons'

// Hash history keeps deep links working on GitHub Pages with no rewrite rules.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
  ],
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
})

router.afterEach((to) => {
  const l = to.name === 'lesson' ? getLesson(String(to.params.id)) : undefined
  document.title = l ? `${l.en} · Programming Lessons` : 'Programming Lessons · درس‌های برنامه‌نویسی'
})

export default router
