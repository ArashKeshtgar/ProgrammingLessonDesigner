<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import OverviewDoc from './OverviewDoc.vue'
import ProjectDoc from './ProjectDoc.vue'
import StylingDoc from './StylingDoc.vue'
import { DOC_LANGS, saveLang, STRINGS, type DocLang } from '../../projects/i18n'
import { page, PAGES, type PageGroup } from '../../projects/model'

// The docs shell, laid out like a reference site: a fixed contents list, the page,
// and previous / next. The language is part of the address (#/projects/en/...).
const route = useRoute()
const lang = computed(() => route.params.lang as DocLang)
const t = computed(() => STRINGS[lang.value])
const current = computed(() => page(String(route.params.page ?? 'overview')) ?? PAGES[0])
watch(lang, saveLang, { immediate: true })

const GROUPS: { group: PageGroup; label: keyof (typeof STRINGS)['en'] }[] = [
  { group: 'overview', label: 'overview' },
  { group: 'server', label: 'groupServer' },
  { group: 'pc', label: 'groupPc' },
  { group: 'external', label: 'groupExternal' },
  { group: 'infra', label: 'groupInfra' },
  { group: 'about', label: 'groupAbout' },
]
const groups = computed(() => GROUPS.map((g) => ({ ...g, pages: PAGES.filter((p) => p.group === g.group) })))
const titleOf = (id: string) => {
  const p = page(id)!
  if (p.project) return p.project.name
  return id === 'styling' ? t.value.styling : t.value.overview
}
// After the router's own title (afterEach), which knows only the address.
watchEffect(() => (document.title = `${titleOf(current.value.id)} · ${t.value.title} · Programming Lessons`))

const at = computed(() => PAGES.indexOf(current.value))
const prev = computed(() => PAGES[at.value - 1])
const next = computed(() => PAGES[at.value + 1])
const href = (id: string, l: DocLang = lang.value) => (id === 'overview' ? `/projects/${l}` : `/projects/${l}/${id}`)

// Phones: the contents list folds into a menu; it closes after picking a page.
const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <div class="docs" :dir="lang === 'fa' ? 'rtl' : 'ltr'" :lang="lang">
    <header class="docs-head">
      <button type="button" class="docs-menu" :aria-expanded="menuOpen" aria-controls="docs-side" @click="menuOpen = !menuOpen">
        {{ t.menu }}
      </button>
      <div class="docs-title">
        <strong>{{ t.title }}</strong>
        <span>{{ t.tagline }}</span>
      </div>
      <nav class="lang-switch" aria-label="Language">
        <RouterLink v-for="l in DOC_LANGS" :key="l" :to="href(current.id, l)" :class="{ on: l === lang }" :lang="l" :hreflang="l">
          {{ STRINGS[l].langName }}
        </RouterLink>
      </nav>
    </header>

    <div class="docs-body">
      <nav id="docs-side" class="docs-side" :class="{ open: menuOpen }" :aria-label="t.title">
        <template v-for="g in groups" :key="g.group">
          <h3 v-if="g.group !== 'overview'">{{ t[g.label] }}</h3>
          <RouterLink
            v-for="p in g.pages"
            :key="p.id"
            :to="href(p.id)"
            :class="[p.project ? `accent-${p.project.id}` : '', { on: p.id === current.id }]"
            :aria-current="p.id === current.id ? 'page' : undefined"
          >
            {{ titleOf(p.id) }}
          </RouterLink>
        </template>
      </nav>

      <main class="docs-main">
        <nav class="docs-pager">
          <RouterLink v-if="prev" :to="href(prev.id)" class="prev">{{ t.previous }}</RouterLink>
          <RouterLink v-if="next" :to="href(next.id)" class="next">{{ t.next }}</RouterLink>
        </nav>

        <OverviewDoc v-if="current.group === 'overview'" :lang="lang" />
        <StylingDoc v-else-if="current.id === 'styling'" :lang="lang" />
        <ProjectDoc v-else :key="current.id" :project="current.project!" :lang="lang" />

        <nav class="docs-pager">
          <RouterLink v-if="prev" :to="href(prev.id)" class="prev">{{ t.previous }}: {{ titleOf(prev.id) }}</RouterLink>
          <RouterLink v-if="next" :to="href(next.id)" class="next">{{ t.next }}: {{ titleOf(next.id) }}</RouterLink>
        </nav>
      </main>
    </div>
  </div>
</template>
