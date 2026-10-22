<!-- #region card -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectStatus } from '../shared/model'

const props = withDefaults(defineProps<{ project: ProjectStatus; busy?: boolean }>(), { busy: false }) // in: :project="p"
const emit = defineEmits<{ refresh: [key: string] }>() // out: @refresh="reload"

const label = computed(() =>
  props.project.healthy ? (props.project.summary ?? 'Healthy') : (props.project.error ?? 'Down'),
)
</script>

<template>
  <article class="card" :class="{ down: !project.healthy }">
    <h3>{{ project.displayName }}</h3>
    <p>{{ label }}</p>
    <button :disabled="busy" @click="emit('refresh', project.key)">Refresh</button>
  </article>
</template>
<!-- #endregion -->
