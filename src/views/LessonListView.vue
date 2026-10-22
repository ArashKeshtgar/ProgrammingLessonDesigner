<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { listLessons, listTags } from '../lib/lessons'

const tags = listTags()
const tag = ref<string>('')
const lessons = computed(() => listLessons(tag.value || undefined))
</script>

<template>
  <main class="page">
    <h1>درس‌ها</h1>
    <p class="lead">
      هر درس یک مفهوم بک‌اند است که در کد واقعی پروژه‌های خودم دیده می‌شود و در چهار زبان مقایسه شده: C#، TypeScript، Python و Java.
    </p>
    <div class="filters" role="group" aria-label="دسته">
      <button :class="{ on: !tag }" @click="tag = ''">همه</button>
      <button v-for="t in tags" :key="t" :class="{ on: tag === t }" @click="tag = t">{{ t }}</button>
    </div>
    <ul class="lesson-list">
      <li v-for="l in lessons" :key="l.id">
        <RouterLink :to="`/lesson/${l.id}`">
          <span class="num">{{ l.n }}</span>
          <span class="titles"><b>{{ l.en }}</b><small>{{ l.fa }}</small></span>
          <span class="tagchip">{{ l.tag }}</span>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>
