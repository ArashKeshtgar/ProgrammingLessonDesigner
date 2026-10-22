<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getLesson, listLessons } from '../lib/lessons'
import LessonBody from '../components/LessonBody.vue'

const route = useRoute()
const lesson = computed(() => getLesson(String(route.params.id)))
// Previous / next stay inside the lesson's own booklet.
const index = computed(() => listLessons(lesson.value?.tag))

function neighbor(offset: number) {
  const i = index.value.findIndex((l) => l.id === route.params.id)
  return index.value[i + offset]?.id ?? null
}
</script>

<template>
  <main v-if="lesson" class="page lesson">
    <div class="lesson-nav">
      <RouterLink to="/">← همه‌ی درس‌ها</RouterLink>
      <RouterLink v-if="neighbor(-1)" :to="`/lesson/${neighbor(-1)}`">‹ قبلی</RouterLink>
      <RouterLink v-if="neighbor(1)" :to="`/lesson/${neighbor(1)}`">بعدی ›</RouterLink>
      <span class="spacer"></span>
      <RouterLink :to="`/booklet/${lesson.tag}`">جزوه‌ی {{ lesson.tag }}</RouterLink>
    </div>
    <LessonBody :lesson="lesson" />
  </main>
  <main v-else class="page">
    <p>درس پیدا نشد.</p>
    <RouterLink to="/">← بازگشت</RouterLink>
  </main>
</template>
