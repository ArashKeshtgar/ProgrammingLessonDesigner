<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { listLessons } from '../lib/lessons'
import { BOOKLETS } from '../lib/booklets'

const base = import.meta.env.BASE_URL
const booklets = Object.entries(BOOKLETS)
  .map(([tag, info]) => ({ tag, ...info, lessons: listLessons(tag) }))
  .filter((b) => b.lessons.length)
</script>

<template>
  <main class="page">
    <h1>درس‌ها</h1>
    <p class="lead">
      هر درس یک مفهوم است که در کد واقعی پروژه‌های خودم دیده می‌شود، کنار هم در چند زبان، با C# به‌عنوان زبان آشنا.
      کدهای علامت‌خورده با «تست‌شده» از پوشه‌ی <code dir="ltr">examples/</code> می‌آیند و در هر push اجرا می‌شوند.
    </p>
    <section v-for="b in booklets" :key="b.tag" class="booklet-group">
      <div class="booklet-head">
        <h2>{{ b.title }} <small>{{ b.fa }}</small></h2>
        <div class="booklet-links">
          <RouterLink :to="`/booklet/${b.tag}`">جزوه‌ی کامل</RouterLink>
          <a :href="`${base}pdf/${b.tag}.pdf`" target="_blank" rel="noopener">PDF</a>
        </div>
      </div>
      <ul class="lesson-list">
        <li v-for="l in b.lessons" :key="l.id">
          <RouterLink :to="`/lesson/${l.id}`">
            <span class="num">{{ l.n }}</span>
            <span class="titles"><b>{{ l.en }}</b><small>{{ l.fa }}</small></span>
          </RouterLink>
        </li>
      </ul>
    </section>
  </main>
</template>
