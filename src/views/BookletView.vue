<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { allLessons } from '../lib/lessons'
import { BOOKLETS } from '../lib/booklets'
import LessonBody from '../components/LessonBody.vue'

// One booklet = every lesson with this tag, fully expanded. The CI prints this page to PDF.
const route = useRoute()
const tag = computed(() => String(route.params.tag))
const lessons = computed(() => allLessons().filter((l) => l.tag === tag.value))
const info = computed(() => BOOKLETS[tag.value])
const pdf = computed(() => `${import.meta.env.BASE_URL}pdf/${tag.value}.pdf`)

function jump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function printPage() {
  window.print()
}
</script>

<template>
  <main class="page booklet">
    <div class="lesson-nav">
      <RouterLink to="/">← همه‌ی درس‌ها</RouterLink>
      <span class="spacer"></span>
      <a :href="pdf" target="_blank" rel="noopener">دانلود PDF</a>
      <button class="btn-link" @click="printPage">چاپ</button>
    </div>
    <header class="cover">
      <p class="kicker">جزوه</p>
      <h1>{{ info?.title ?? tag }}</h1>
      <p class="hfa">{{ info?.fa }}</p>
      <ol class="toc">
        <!-- The router owns the URL hash, so the contents scroll by script instead of #anchors. -->
        <li v-for="l in lessons" :key="l._id"><a href="" @click.prevent="jump(l._id)">{{ l.en }}</a> · {{ l.fa }}</li>
      </ol>
    </header>
    <div v-for="l in lessons" :id="l._id" :key="l._id" class="booklet-lesson">
      <LessonBody :lesson="l" booklet />
    </div>
  </main>
</template>
