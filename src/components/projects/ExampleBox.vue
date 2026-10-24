<script setup lang="ts">
import { computed, ref } from 'vue'
import { extractRegion } from '../../lib/code'
import { highlight } from '../../lib/highlight'
import { STRINGS, type DocLang } from '../../projects/i18n'
import type { DocExample } from '../../projects/model'

// The styling page quotes this repo's own Sass, so what it shows is what is built.
const styles = import.meta.glob<string>('../../styles/**/*.scss', { query: '?raw', import: 'default', eager: true })

const props = defineProps<{ example: DocExample; lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])

const code = computed(() => {
  const ex = props.example
  if (ex.code) return ex.code
  const text = ex.file ? styles[`../../${ex.file}`] : undefined
  if (text === undefined) return `// missing file: ${ex.file}`
  return ex.region ? (extractRegion(text, ex.region) ?? `// missing region "${ex.region}" in ${ex.file}`) : text.trimEnd()
})
const html = computed(() => highlight(code.value, props.example.lang))

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(code.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // clipboard blocked (insecure context): the code stays selectable
  }
}
</script>

<template>
  <figure class="example">
    <figcaption>
      <b>{{ t.example }}</b>
      <span>{{ example.title[lang] }}</span>
      <code v-if="example.file" class="example-path" dir="ltr">src/{{ example.file }}</code>
      <button type="button" class="example-copy" @click="copy">{{ copied ? t.copied : t.copy }}</button>
    </figcaption>
    <pre dir="ltr"><code class="hljs" v-html="html"></code></pre>
  </figure>
</template>
