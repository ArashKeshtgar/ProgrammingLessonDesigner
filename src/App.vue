<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="topbar">
    <div class="topbar-in">
      <RouterLink to="/" class="brand">Programming · Lessons</RouterLink>
      <small>درس‌های برنامه‌نویسی با کد واقعی</small>
    </div>
  </nav>
  <RouterView />
</template>
