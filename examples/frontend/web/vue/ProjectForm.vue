<!-- #region form -->
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { validateProject, type CreateProject } from '../shared/model'
import { useProjects } from './useProjects'

const { create } = useProjects()
// v-model binds each input to a field of this reactive object, both ways.
const form = reactive<CreateProject>({ key: '', displayName: '', adapterBaseUrl: '' })
const touched = ref(false)
const saving = ref(false)
const serverError = ref<string | null>(null)
const errors = computed(() => validateProject(form)) // recomputed when a field changes

async function submit() {
  touched.value = true
  if (Object.keys(errors.value).length) return
  saving.value = true
  try {
    await create({ ...form })
    Object.assign(form, { key: '', displayName: '', adapterBaseUrl: '' })
    touched.value = false
  } catch (e) {
    serverError.value = (e as Error).message // the server checks again (e.g. 409 already exists)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="submit">
    <label>Key <input v-model.trim="form.key" /></label>
    <small v-if="touched && errors.key">{{ errors.key }}</small>
    <label>Name <input v-model="form.displayName" /></label>
    <small v-if="touched && errors.displayName">{{ errors.displayName }}</small>
    <label>Adapter URL <input v-model.trim="form.adapterBaseUrl" /></label>
    <small v-if="touched && errors.adapterBaseUrl">{{ errors.adapterBaseUrl }}</small>
    <p v-if="serverError" role="alert">{{ serverError }}</p>
    <button :disabled="saving">Save</button>
  </form>
</template>
<!-- #endregion -->
