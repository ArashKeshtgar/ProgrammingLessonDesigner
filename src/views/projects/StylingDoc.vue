<script setup lang="ts">
import { computed } from 'vue'
import DocSections from '../../components/projects/DocSections.vue'
import { STRINGS, type DocLang } from '../../projects/i18n'
import { doc } from '../../projects/model'

const props = defineProps<{ lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])
const content = doc('styling')!
</script>

<template>
  <article>
    <h1>{{ t.styling }}</h1>
    <p v-if="content.summary" class="project-summary">{{ content.summary[lang] }}</p>
    <DocSections :sections="content[lang] ?? []" :examples="content.examples" :lang="lang" />
  </article>
</template>
