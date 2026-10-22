<script setup lang="ts">
import { computed } from 'vue'
import CodeTabs from './CodeTabs.vue'
import CompareTable from './CompareTable.vue'
import { BACKEND_LANGS, LANG_LABELS, type CodeSample, type Lesson } from '../types/lesson'

// `booklet` = everything expanded (all languages, answers shown) for reading on paper.
const props = defineProps<{ lesson: Lesson; booklet?: boolean }>()

const langs = computed(() => props.lesson.langs ?? BACKEND_LANGS)
const known = computed(() => props.lesson.known ?? 'csharp')

// Samples that share a `group` render as one block, in file order.
const groups = computed(() => {
  const map = new Map<string, CodeSample[]>()
  for (const s of props.lesson.code) map.set(s.group, [...(map.get(s.group) ?? []), s])
  return [...map.values()]
})

const label = (id: string) => (id === 'all' ? 'همه' : LANG_LABELS[id as keyof typeof LANG_LABELS])
</script>

<template>
  <article class="lesson-body">
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
      <div v-for="c in lesson.concepts" :key="c.h" class="concept">
        <h3>{{ c.h }}</h3>
        <p>{{ c.body }}</p>
      </div>
    </section>

    <section>
      <h2>مقایسه</h2>
      <CompareTable :rows="lesson.compare" :langs="langs" :known="known" />
    </section>

    <section>
      <h2>کد</h2>
      <CodeTabs v-for="g in groups" :key="g[0].group" :samples="g" :order="langs" :all="booklet" />
    </section>

    <section>
      <h2>اشتباه‌های رایج</h2>
      <div v-for="p in lesson.pitfalls" :key="p.mistake" class="pitfall">
        <div class="pf-head"><span class="tagchip">{{ label(p.lang) }}</span><b>{{ p.mistake }}</b></div>
        <p><i>چرا:</i> {{ p.why }}</p>
        <p><i>درست:</i> {{ p.fix }}</p>
      </div>
    </section>

    <section>
      <h2>این کد کجای پروژه‌هاست</h2>
      <ul class="refs">
        <li v-for="r in lesson.refs" :key="r.project + r.file + r.line">
          <code dir="ltr">{{ r.project }}/{{ r.file }}{{ r.line ? ':' + r.line : '' }}</code>
          <span>{{ r.note }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h2>تمرین</h2>
      <details v-for="(e, i) in lesson.exercises" :key="i" class="exercise" :open="booklet">
        <summary>{{ i + 1 }}. {{ e.q }}</summary>
        <p v-if="e.hint" class="hint"><i>راهنما:</i> {{ e.hint }}</p>
        <p class="answer"><i>پاسخ:</i> {{ e.a }}</p>
      </details>
    </section>

    <section class="take">
      <b>جمله‌ی مصاحبه</b>
      <p dir="ltr">{{ lesson.take }}</p>
    </section>
  </article>
</template>
