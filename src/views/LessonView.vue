<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getLesson, listLessons } from '../lib/lessons'
import CodeTabs from '../components/CodeTabs.vue'
import CompareTable from '../components/CompareTable.vue'
import { LANGS, type CodeSample } from '../types/lesson'

const route = useRoute()
const lesson = computed(() => getLesson(String(route.params.id)))
const index = listLessons()

function neighbor(offset: number) {
  const i = index.findIndex((l) => l.id === route.params.id)
  return index[i + offset]?.id ?? null
}

// Samples that share a `group` render as one tabbed block, in file order.
const groups = computed(() => {
  const map = new Map<string, CodeSample[]>()
  for (const s of lesson.value?.code ?? []) map.set(s.group, [...(map.get(s.group) ?? []), s])
  return [...map.values()]
})

function printPage() {
  window.print()
}

const label = (id: string) => LANGS.find((l) => l.id === id)?.label ?? 'همه'
</script>

<template>
  <main v-if="lesson" class="page lesson">
    <div class="lesson-nav">
      <RouterLink to="/">← همه‌ی درس‌ها</RouterLink>
      <RouterLink v-if="neighbor(-1)" :to="`/lesson/${neighbor(-1)}`">‹ قبلی</RouterLink>
      <RouterLink v-if="neighbor(1)" :to="`/lesson/${neighbor(1)}`">بعدی ›</RouterLink>
      <span class="spacer"></span>
      <button class="btn-link" @click="printPage">چاپ / PDF</button>
    </div>

    <header class="hero">
      <div class="tagchip">{{ lesson.tag }} · درس {{ lesson.n }}</div>
      <h1>{{ lesson.en }}</h1>
      <p class="hfa">{{ lesson.fa }}</p>
      <div class="topics"><span v-for="t in lesson.topics" :key="t">{{ t }}</span></div>
    </header>

    <section>
      <h2>بعد از این درس می‌توانی</h2>
      <ul class="goals"><li v-for="g in lesson.goal" :key="g">{{ g }}</li></ul>
    </section>

    <section>
      <h2>سناریو از پروژه‌ی واقعی</h2>
      <p>{{ lesson.story }}</p>
      <div class="dialog">
        <p v-for="([who, line], i) in lesson.why" :key="i" :class="{ asks: who === 'Q' }">
          <b>{{ who === 'Q' ? 'سؤال' : 'پاسخ' }}</b> {{ line }}
        </p>
      </div>
    </section>

    <section>
      <h2>مفهوم‌ها</h2>
      <article v-for="c in lesson.concepts" :key="c.h" class="concept">
        <h3>{{ c.h }}</h3>
        <p>{{ c.body }}</p>
      </article>
    </section>

    <section>
      <h2>مقایسه‌ی چهار زبان</h2>
      <CompareTable :rows="lesson.compare" />
    </section>

    <section>
      <h2>کد</h2>
      <CodeTabs v-for="g in groups" :key="g[0].group" :samples="g" />
    </section>

    <section>
      <h2>اشتباه‌های رایج</h2>
      <article v-for="p in lesson.pitfalls" :key="p.mistake" class="pitfall">
        <div class="pf-head"><span class="tagchip">{{ label(p.lang) }}</span><b>{{ p.mistake }}</b></div>
        <p><i>چرا:</i> {{ p.why }}</p>
        <p><i>درست:</i> {{ p.fix }}</p>
      </article>
    </section>

    <section>
      <h2>این کد کجای پروژه‌هاست</h2>
      <ul class="refs">
        <li v-for="r in lesson.refs" :key="r.file + r.line">
          <code dir="ltr">{{ r.project }}/{{ r.file }}{{ r.line ? ':' + r.line : '' }}</code>
          <span>{{ r.note }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h2>تمرین</h2>
      <details v-for="(e, i) in lesson.exercises" :key="i" class="exercise">
        <summary>{{ i + 1 }}. {{ e.q }}</summary>
        <p v-if="e.hint" class="hint"><i>راهنما:</i> {{ e.hint }}</p>
        <p class="answer"><i>پاسخ:</i> {{ e.a }}</p>
      </details>
    </section>

    <section class="take">
      <b>جمله‌ی مصاحبه</b>
      <p dir="ltr">{{ lesson.take }}</p>
    </section>
  </main>
  <main v-else class="page">
    <p>درس پیدا نشد.</p>
    <RouterLink to="/">← بازگشت</RouterLink>
  </main>
</template>
