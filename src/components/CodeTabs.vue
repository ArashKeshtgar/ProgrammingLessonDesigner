<script setup lang="ts">
import { computed, ref } from 'vue'
import { LANG_LABELS, type CodeSample, type Lang } from '../types/lesson'
import { highlightLanguage, sampleCode } from '../lib/code'
import { highlight } from '../lib/highlight'

// `all` shows every language one under the other (booklet / print), instead of tabs.
const props = defineProps<{ samples: CodeSample[]; order: Lang[]; all?: boolean }>()

const ordered = computed(() =>
  [...props.samples].sort((a, b) => props.order.indexOf(a.lang) - props.order.indexOf(b.lang)),
)
const active = ref<Lang | undefined>(ordered.value[0]?.lang)
const shown = computed(() => (props.all ? ordered.value : ordered.value.filter((s) => s.lang === active.value)))
const html = (s: CodeSample) => highlight(sampleCode(s), highlightLanguage(s))

const ORIGIN: Record<CodeSample['origin'], string> = {
  real: 'از کد واقعی پروژه (کوتاه‌شده)',
  tested: 'کد اجراشده و تست‌شده در examples/',
  port: 'معادل نوشته‌شده، اجرا نشده',
}

const copied = ref(false)
async function copy(s: CodeSample) {
  try {
    await navigator.clipboard.writeText(sampleCode(s))
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // clipboard can be blocked (insecure context); the code stays selectable
  }
}
</script>

<template>
  <figure v-if="ordered.length" class="code-tabs" :class="{ all }">
    <figcaption>
      <b>{{ ordered[0].title }}</b>
    </figcaption>
    <div v-if="!all" class="tabs" role="tablist">
      <button
        v-for="s in ordered"
        :key="s.lang"
        role="tab"
        :aria-selected="s.lang === active"
        :class="{ on: s.lang === active }"
        @click="active = s.lang"
      >
        {{ LANG_LABELS[s.lang] }}
      </button>
      <span class="spacer"></span>
      <button class="copy" @click="copy(shown[0])">{{ copied ? 'کپی شد' : 'کپی' }}</button>
    </div>
    <div v-for="s in shown" :key="s.lang" class="sample">
      <div class="sample-head">
        <span v-if="all" class="lang">{{ LANG_LABELS[s.lang] }}</span>
        <span class="origin" :class="s.origin">{{ ORIGIN[s.origin] }}</span>
        <code v-if="s.file" class="path" dir="ltr">examples/{{ s.file }}</code>
      </div>
      <pre dir="ltr"><code class="hljs" v-html="html(s)"></code></pre>
    </div>
  </figure>
</template>
