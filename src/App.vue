<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const section = computed(() => (route.name === 'review' || route.name === 'projects' ? route.name : 'lessons'))
</script>

<template>
  <nav class="topbar">
    <div class="topbar-in">
      <RouterLink to="/" class="brand">Programming · Lessons</RouterLink>
      <RouterLink to="/" class="tab" :class="{ on: section === 'lessons' }">درس‌ها</RouterLink>
      <RouterLink to="/review" class="tab" :class="{ on: section === 'review' }">مرور</RouterLink>
      <RouterLink to="/projects" class="tab" :class="{ on: section === 'projects' }">پروژه‌ها</RouterLink>
    </div>
  </nav>
  <RouterView />
</template>
