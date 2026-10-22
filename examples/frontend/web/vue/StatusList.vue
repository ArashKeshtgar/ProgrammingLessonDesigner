<!-- #region list -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ProjectStatus } from '../shared/model'
import { apiFetch } from './session'
import StatusCard from './StatusCard.vue'

// ref(): reactive state; the template re-renders when .value changes.
const projects = ref<ProjectStatus[] | null>(null)
const busyKey = ref<string | null>(null)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    projects.value = await apiFetch<ProjectStatus[]>('/projects')
  } catch (e) {
    error.value = (e as Error).message
  }
})

async function reload(key: string) {
  busyKey.value = key
  try {
    const fresh = await apiFetch<ProjectStatus>(`/projects/${encodeURIComponent(key)}`)
    projects.value = projects.value?.map((p) => (p.key === key ? fresh : p)) ?? null
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busyKey.value = null
  }
}
</script>

<template>
  <p v-if="error" role="alert">{{ error }}</p>
  <p v-else-if="!projects">Loading…</p>
  <StatusCard v-for="p in projects" v-else :key="p.key" :project="p" :busy="busyKey === p.key" @refresh="reload" />
</template>
<!-- #endregion -->
