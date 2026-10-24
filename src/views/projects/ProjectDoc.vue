<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DocSections from '../../components/projects/DocSections.vue'
import SystemMap, { type MapNode } from '../../components/projects/SystemMap.vue'
import { STRINGS, type DocLang } from '../../projects/i18n'
import {
  doc,
  linksFrom,
  linksTo,
  MAP,
  projectById,
  projectOfNode,
  serviceById,
  sitesOf,
  type MapProject,
} from '../../projects/model'

const props = defineProps<{ project: MapProject; lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])
const content = computed(() => doc(props.project.id))
const runs = computed(() => (!props.project.inCompose ? t.value.runsExternal : props.project.onVps ? t.value.runsVps : t.value.runsPc))
const services = computed(() => props.project.services.map((id) => serviceById(id)!))
const out = computed(() => linksFrom(props.project.id))
const inc = computed(() => linksTo(props.project.id))

// The project's own services and everything one arrow away from them.
const edges = computed(() =>
  MAP.edges.filter((e) => props.project.services.includes(e.from) || props.project.services.includes(e.to)),
)
const nodes = computed<MapNode[]>(() => {
  const ids = new Set([...props.project.services, ...edges.value.flatMap((e) => [e.from, e.to])])
  return [...ids].map((id) => {
    const owner = projectById(projectOfNode(id))!
    const own = owner.id === props.project.id
    const svc = serviceById(id)
    return {
      id,
      label: svc ? id : owner.name,
      sub: own ? t.value.kinds[svc!.kind] : owner.name,
      project: owner.id,
      where: !svc ? 'external' : svc.vps ? 'vps' : 'pc',
      to: own ? undefined : `/projects/${props.lang}/${owner.id}`,
    }
  })
})
const arrows = computed(() => edges.value.map((e) => ({ from: e.from, to: e.to, title: e.labels?.join(', ') ?? '' })))
const nameOf = (id: string) => projectById(id)!.name
</script>

<template>
  <article :class="`accent-${project.id}`">
    <h1 class="project-title">{{ project.name }}</h1>
    <p v-if="content?.summary" class="project-summary">{{ content.summary[lang] }}</p>

    <h2>{{ t.atGlance }}</h2>
    <dl class="glance">
      <dt>{{ t.repo }}</dt>
      <dd><code dir="ltr">{{ project.repo }}</code></dd>
      <dt>{{ t.runs }}</dt>
      <dd>{{ runs }}</dd>
      <template v-if="sitesOf(project).length">
        <dt>{{ t.domains }}</dt>
        <dd>
          <span v-for="s in sitesOf(project)" :key="s.domain" class="site">
            <a :href="`https://${s.domain}/`" dir="ltr" rel="noopener">{{ s.domain }}</a>
            <span :class="['access', s.private ? 'is-private' : 'is-public']">{{ s.private ? t.private : t.public }}</span>
          </span>
        </dd>
      </template>
    </dl>

    <template v-if="services.length">
      <h2>{{ t.services }}</h2>
      <div class="doc-table-wrap">
        <table class="doc-table">
          <thead>
            <tr>
              <th>{{ t.service }}</th>
              <th>{{ t.kind }}</th>
              <th>{{ t.notes }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in services" :key="s.id">
              <td dir="ltr"><code>{{ s.id }}</code></td>
              <td>{{ t.kinds[s.kind] }}</td>
              <td>
                <span v-if="s.managed">{{ t.managed }} «{{ s.managed }}»</span>
                <span v-if="s.profiles"> {{ t.profile }}: <code dir="ltr">{{ s.profiles.join(', ') }}</code></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <h2>{{ t.connections }}</h2>
    <div class="connections">
      <section>
        <h3>{{ t.talksTo }}</h3>
        <ul v-if="out.length">
          <li v-for="l in out" :key="l.to">
            <RouterLink :to="`/projects/${lang}/${l.to}`">{{ nameOf(l.to) }}</RouterLink>
            <small> {{ t.via }} <code v-for="v in l.via" :key="v" dir="ltr">{{ v }}</code></small>
          </li>
        </ul>
        <p v-else class="muted">{{ t.none }}</p>
      </section>
      <section>
        <h3>{{ t.usedBy }}</h3>
        <ul v-if="inc.length">
          <li v-for="l in inc" :key="l.from">
            <RouterLink :to="`/projects/${lang}/${l.from}`">{{ nameOf(l.from) }}</RouterLink>
            <small> {{ t.via }} <code v-for="v in l.via" :key="v" dir="ltr">{{ v }}</code></small>
          </li>
        </ul>
        <p v-else class="muted">{{ t.none }}</p>
      </section>
    </div>

    <template v-if="nodes.length > 1">
      <h2>{{ t.diagram }}</h2>
      <SystemMap :nodes="nodes" :arrows="arrows" :label="`${project.name}: ${t.diagram}`" />
    </template>

    <p v-if="!content?.[lang]" class="doc-note">{{ t.noWriteup }}</p>
    <DocSections v-if="content" :content="content" :lang="lang" />
  </article>
</template>
