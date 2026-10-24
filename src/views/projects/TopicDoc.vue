<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DocSections from '../../components/projects/DocSections.vue'
import { STRINGS, type DocLang } from '../../projects/i18n'
import { codeOf, topicExamples, topicsOf, type MapProject, type Topic } from '../../projects/model'

// One part of a project: its files, then short sections, each with the real code.
const props = defineProps<{ project: MapProject; topic: Topic; lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])
const code = computed(() => codeOf(props.project.id))
const group = computed(() => topicsOf(props.project.id)?.groups.find((g) => g.id === props.topic.group))
const examples = computed(() => topicExamples(props.project.id, props.topic))
</script>

<template>
  <article :class="`accent-${project.id}`">
    <p class="breadcrumb">
      <RouterLink :to="`/projects/${lang}/${project.id}`">{{ project.name }}</RouterLink>
      <span aria-hidden="true"> › </span>
      <span>{{ group?.title[lang] }}</span>
    </p>
    <h1 class="project-title">{{ topic.title[lang] }}</h1>

    <div v-if="topic.files?.length" class="topic-files">
      <b>{{ t.files }}</b>
      <ul>
        <li v-for="f in topic.files" :key="f">
          <code dir="ltr">{{ f }}</code>
          <small v-if="code?.files[f]" class="muted">{{ t.lines(code.files[f]) }}</small>
        </li>
      </ul>
    </div>

    <DocSections :sections="topic[lang]" :examples="examples" :code="code" :lang="lang" />
  </article>
</template>
