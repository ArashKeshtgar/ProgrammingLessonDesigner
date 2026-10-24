<script setup lang="ts">
import { computed } from 'vue'
import ExampleBox from './ExampleBox.vue'
import { inline, STRINGS, type DocLang } from '../../projects/i18n'
import type { DocContent } from '../../projects/model'

const props = defineProps<{ content: DocContent; lang: DocLang }>()
const sections = computed(() => props.content[props.lang] ?? [])
const t = computed(() => STRINGS[props.lang])
</script>

<template>
  <section v-for="s in sections" :id="s.id" :key="s.id" class="doc-section">
    <h2>{{ s.h }}</h2>
    <p v-for="(p, i) in s.p ?? []" :key="i" v-html="inline(p)"></p>
    <ul v-if="s.list">
      <li v-for="(li, i) in s.list" :key="i" v-html="inline(li)"></li>
    </ul>
    <ExampleBox v-for="id in s.examples ?? []" :key="id" :example="content.examples![id]" :lang="lang" />
  </section>
  <section v-if="content.refs?.length" class="doc-section">
    <h2>{{ t.source }}</h2>
    <ul class="doc-refs">
      <li v-for="r in content.refs" :key="r.file + r.line">
        <code dir="ltr">{{ r.project }}/{{ r.file }}{{ r.line ? `:${r.line}` : '' }}</code>
        <span>{{ r.note[lang] }}</span>
      </li>
    </ul>
  </section>
</template>
