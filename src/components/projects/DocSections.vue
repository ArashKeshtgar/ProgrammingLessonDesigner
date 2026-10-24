<script setup lang="ts">
import { computed } from 'vue'
import DataTable from './DataTable.vue'
import ExampleBox from './ExampleBox.vue'
import { inline, STRINGS, type DocLang } from '../../projects/i18n'
import type { CodeSnapshot, DocExample, DocRef, DocSection } from '../../projects/model'

const props = defineProps<{
  sections: DocSection[]
  examples?: Record<string, DocExample>
  refs?: DocRef[]
  code?: CodeSnapshot
  lang: DocLang
}>()
const t = computed(() => STRINGS[props.lang])
</script>

<template>
  <section v-for="s in sections" :id="s.id" :key="s.id" class="doc-section">
    <h2>{{ s.h }}</h2>
    <p v-for="(p, i) in s.p ?? []" :key="i" v-html="inline(p)"></p>
    <ul v-if="s.list">
      <li v-for="(li, i) in s.list" :key="i" v-html="inline(li)"></li>
    </ul>
    <DataTable v-if="s.data && code" :data="s.data" :code="code" :lang="lang" />
    <ExampleBox v-for="id in s.examples ?? []" :key="id" :example="examples![id]" :lang="lang" />
  </section>
  <section v-if="refs?.length" class="doc-section">
    <h2>{{ t.source }}</h2>
    <ul class="doc-refs">
      <li v-for="r in refs" :key="r.file + r.line">
        <code dir="ltr">{{ r.project }}/{{ r.file }}{{ r.line ? `:${r.line}` : '' }}</code>
        <span>{{ r.note[lang] }}</span>
      </li>
    </ul>
  </section>
</template>
