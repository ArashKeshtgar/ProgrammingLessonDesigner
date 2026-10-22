<script setup lang="ts">
import { computed, ref } from 'vue'
import { LANGS, type CodeSample } from '../types/lesson'

const props = defineProps<{ samples: CodeSample[] }>()

const available = computed(() => LANGS.filter((l) => props.samples.some((s) => s.lang === l.id)))
const active = ref(available.value[0]?.id)
const sample = computed(() => props.samples.find((s) => s.lang === active.value))
const copied = ref(false)

async function copy() {
  if (!sample.value) return
  try {
    await navigator.clipboard.writeText(sample.value.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // clipboard can be blocked (insecure context); the code stays selectable
  }
}
</script>

<template>
  <figure v-if="sample" class="code-tabs">
    <figcaption>
      <b>{{ sample.title }}</b>
      <span class="origin" :class="sample.origin">
        {{ sample.origin === 'real' ? 'از کد واقعی پروژه (کوتاه‌شده)' : 'معادل نوشته‌شده برای این درس' }}
      </span>
    </figcaption>
    <div class="tabs" role="tablist">
      <button
        v-for="l in available"
        :key="l.id"
        role="tab"
        :aria-selected="l.id === active"
        :class="{ on: l.id === active }"
        @click="active = l.id"
      >
        {{ l.label }}
      </button>
      <span class="spacer"></span>
      <button class="copy" @click="copy">{{ copied ? 'کپی شد' : 'کپی' }}</button>
    </div>
    <pre dir="ltr"><code>{{ sample.code }}</code></pre>
  </figure>
</template>
