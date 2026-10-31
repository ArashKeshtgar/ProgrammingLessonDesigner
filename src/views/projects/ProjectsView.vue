<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import OverviewDoc from './OverviewDoc.vue'
import ProjectDoc from './ProjectDoc.vue'
import StylingDoc from './StylingDoc.vue'
import TopicDoc from './TopicDoc.vue'
import { DOC_LANGS, saveLang, STRINGS, type DocLang } from '../../projects/i18n'
import { page, PAGES, topicsOf, type PageGroup } from '../../projects/model'
import { isRead, readCount } from '../../projects/progress'
import { search } from '../../projects/search'

// The docs shell, laid out like a reference site: a fixed contents list, the page,
// and previous / next. The address carries the language and the page:
// #/projects/<lang>, #/projects/<lang>/<project>, #/projects/<lang>/<project>/<topic>.
const route = useRoute()
const router = useRouter()
const lang = computed(() => route.params.lang as DocLang)
const t = computed(() => STRINGS[lang.value])
const currentId = computed(() => {
  const { page: p, topic } = route.params
  return p ? (topic ? `${p}/${topic}` : String(p)) : 'overview'
})
const current = computed(() => page(currentId.value) ?? PAGES[0])
watch(lang, saveLang, { immediate: true })

const GROUPS: { group: PageGroup; label: keyof (typeof STRINGS)['en'] }[] = [
  { group: 'server', label: 'groupServer' },
  { group: 'pc', label: 'groupPc' },
  { group: 'external', label: 'groupExternal' },
  { group: 'infra', label: 'groupInfra' },
]
// Projects by where they run; the project you are in opens up to show its topics.
const groups = computed(() =>
  GROUPS.map((g) => ({ ...g, pages: PAGES.filter((p) => p.group === g.group && !p.topic) })),
)
const openTopics = computed(() => {
  const id = current.value.project?.id
  const topics = id ? topicsOf(id) : undefined
  if (!topics) return []
  return topics.groups.map((g) => ({ ...g, pages: topics.pages.filter((x) => x.group === g.id) }))
})
// Clicking the open project again folds its topics away, and the next click opens them;
// going to another project opens that one.
const collapsed = ref<string | null>(null)
watch(() => current.value.project?.id, (id) => id !== collapsed.value && (collapsed.value = null))
const isOpen = (id: string) => id === current.value.project?.id && id !== collapsed.value
const toggle = (id: string) => {
  if (id === current.value.project?.id) collapsed.value = collapsed.value === id ? null : id
}

const titleOf = (id: string) => {
  const p = page(id)!
  if (p.topic) return p.topic.title[lang.value]
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

// Search: while there is a query, the contents list shows what matches instead.
const query = ref('')
const hits = computed(() => search(query.value, lang.value))
watch(() => route.fullPath, () => (query.value = ''))
const searchBox = ref<HTMLInputElement>()
const goFirst = () => hits.value[0] && router.push(href(hits.value[0].page.id))
// "/" anywhere on the page (outside a field) jumps to the search box, as on most docs sites.
const onKey = (e: KeyboardEvent) => {
  const el = e.target as HTMLElement
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || el.closest('input, textarea, [contenteditable]')) return
  e.preventDefault()
  menuOpen.value = true
  searchBox.value?.focus()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

const progressOf = (id: string) => {
  const pages = topicsOf(id)?.pages
  const n = (x: number) => x.toLocaleString(lang.value === 'fa' ? 'fa-IR' : 'en')
  return pages ? `${n(readCount(id, pages))}/${n(pages.length)}` : ''
}
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
        <div class="docs-search" role="search">
          <input
            ref="searchBox"
            v-model="query"
            type="search"
            :placeholder="t.searchHint"
            :aria-label="t.search"
            aria-controls="docs-hits"
            @keydown.enter="goFirst"
            @keydown.esc="query = ''"
          />
        </div>
        <div v-if="query.trim()" id="docs-hits" class="docs-hits" aria-live="polite">
          <RouterLink v-for="h in hits" :key="h.page.id" :to="href(h.page.id)" :class="`accent-${h.page.project!.id}`">
            {{ titleOf(h.page.id) }}
            <small v-if="h.page.topic">{{ h.page.project!.name }}<template v-if="h.head"> · {{ t.inHeading }}: {{ h.head }}</template></small>
          </RouterLink>
          <p v-if="!hits.length" class="muted">{{ t.noResults }}</p>
        </div>
        <template v-else>
        <RouterLink :to="href('overview')" :class="{ on: current.id === 'overview' }">{{ t.overview }}</RouterLink>
        <template v-for="g in groups" :key="g.group">
          <h3>{{ t[g.label] }}</h3>
          <template v-for="p in g.pages" :key="p.id">
            <RouterLink
              :to="href(p.id)"
              :class="[`accent-${p.project!.id}`, { on: p.id === current.id, open: isOpen(p.project!.id) }]"
              :aria-current="p.id === current.id ? 'page' : undefined"
              :aria-expanded="topicsOf(p.project!.id) ? isOpen(p.project!.id) : undefined"
              @click="toggle(p.project!.id)"
            >
              {{ titleOf(p.id) }}
              <small v-if="progressOf(p.project!.id)" class="side-progress">{{ progressOf(p.project!.id) }}</small>
            </RouterLink>
            <div v-if="isOpen(p.project!.id) && openTopics.length" :class="['side-topics', `accent-${p.project!.id}`]">
              <template v-for="tg in openTopics" :key="tg.id">
                <h4>{{ tg.title[lang] }}</h4>
                <RouterLink
                  v-for="topic in tg.pages"
                  :key="topic.id"
                  :to="href(`${p.id}/${topic.id}`)"
                  :class="{ on: `${p.id}/${topic.id}` === current.id }"
                  :aria-current="`${p.id}/${topic.id}` === current.id ? 'page' : undefined"
                >
                  {{ topic.title[lang] }}
                  <span v-if="isRead(`${p.id}/${topic.id}`)" class="read-mark" :title="t.isRead">✓</span>
                </RouterLink>
              </template>
            </div>
          </template>
        </template>
        <h3>{{ t.groupAbout }}</h3>
        <RouterLink :to="href('styling')" :class="{ on: current.id === 'styling' }">{{ t.styling }}</RouterLink>
        </template>
      </nav>

      <main class="docs-main">
        <nav class="docs-pager">
          <RouterLink v-if="prev" :to="href(prev.id)" class="prev">{{ t.previous }}</RouterLink>
          <RouterLink v-if="next" :to="href(next.id)" class="next">{{ t.next }}</RouterLink>
        </nav>

        <OverviewDoc v-if="current.group === 'overview'" :lang="lang" />
        <StylingDoc v-else-if="current.id === 'styling'" :lang="lang" />
        <TopicDoc v-else-if="current.topic" :key="current.id" :project="current.project!" :topic="current.topic" :lang="lang" />
        <ProjectDoc v-else :key="current.id" :project="current.project!" :lang="lang" />

        <nav class="docs-pager">
          <RouterLink v-if="prev" :to="href(prev.id)" class="prev">{{ t.previous }}: {{ titleOf(prev.id) }}</RouterLink>
          <RouterLink v-if="next" :to="href(next.id)" class="next">{{ t.next }}: {{ titleOf(next.id) }}</RouterLink>
        </nav>
      </main>
    </div>
  </div>
</template>
