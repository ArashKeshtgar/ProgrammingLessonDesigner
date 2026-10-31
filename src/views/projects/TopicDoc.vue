<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import DocSections from '../../components/projects/DocSections.vue'
import TopicQuiz from '../../components/projects/TopicQuiz.vue'
import { STRINGS, type DocLang } from '../../projects/i18n'
import { loadedProject, loadProject, topicExamples, topicsOf, type MapProject, type TopicMeta } from '../../projects/model'
import { isRead, setRead } from '../../projects/progress'

// One part of a project: its files, then short sections, each with the real code,
// and a quiz. The text comes with the project's file, loaded on the first visit.
const props = defineProps<{ project: MapProject; topic: TopicMeta; lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])
const group = computed(() => topicsOf(props.project.id)?.groups.find((g) => g.id === props.topic.group))

const failed = ref(false)
const load = () => {
  failed.value = false
  loadProject(props.project.id).catch(() => (failed.value = true))
}
watch(() => props.project.id, load, { immediate: true })

const loaded = computed(() => loadedProject(props.project.id))
const full = computed(() => loaded.value?.topics.pages.find((p) => p.id === props.topic.id))
const code = computed(() => loaded.value?.code)
const examples = computed(() => (full.value ? topicExamples(full.value, code.value) : {}))

const readId = computed(() => `${props.project.id}/${props.topic.id}`)
</script>

<template>
  <article :class="`accent-${project.id}`">
    <p class="breadcrumb">
      <RouterLink :to="`/projects/${lang}/${project.id}`">{{ project.name }}</RouterLink>
      <span aria-hidden="true"> › </span>
      <span>{{ group?.title[lang] }}</span>
    </p>
    <h1 class="project-title">{{ topic.title[lang] }}</h1>

    <template v-if="full">
      <div v-if="full.files?.length" class="topic-files">
        <b>{{ t.files }}</b>
        <ul>
          <li v-for="f in full.files" :key="f">
            <code dir="ltr">{{ f }}</code>
            <small v-if="code?.files[f]" class="muted">{{ t.lines(code.files[f]) }}</small>
          </li>
        </ul>
      </div>

      <DocSections :sections="full[lang]" :examples="examples" :code="code" :lang="lang" />

      <TopicQuiz v-if="full.quiz?.length" :key="readId" :quiz="full.quiz" :lang="lang" @done="setRead(readId, true)" />

      <p class="topic-done">
        <button type="button" :class="{ on: isRead(readId) }" :aria-pressed="isRead(readId)" @click="setRead(readId, !isRead(readId))">
          {{ isRead(readId) ? t.isRead : t.markRead }}
        </button>
      </p>
    </template>
    <p v-else-if="failed" class="doc-note">
      {{ t.loadFailed }} <button type="button" class="quiz-again" @click="load">{{ t.retry }}</button>
    </p>
    <p v-else class="muted" aria-live="polite">{{ t.loading }}</p>
  </article>
</template>
