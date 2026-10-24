<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DocSections from '../../components/projects/DocSections.vue'
import SystemMap, { type MapNode } from '../../components/projects/SystemMap.vue'
import { STRINGS, type DocLang } from '../../projects/i18n'
import { doc, MAP, projectOfNode, projectById } from '../../projects/model'

const props = defineProps<{ lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])
const intro = doc('overview')

const nodes = computed<MapNode[]>(() =>
  MAP.projects.map((p) => {
    const where = !p.inCompose ? 'external' : p.onVps ? 'vps' : 'pc'
    return {
      id: p.id,
      label: p.name,
      sub: where === 'vps' ? t.value.counts(p.services.length) : where === 'pc' ? t.value.groupPc : t.value.groupExternal,
      project: p.id,
      where,
      to: `/projects/${props.lang}/${p.id}`,
    }
  }),
)
const arrows = computed(() =>
  MAP.links.map((l) => ({ from: l.from, to: l.to, title: `${projectById(l.from)!.name} → ${projectById(l.to)!.name}\n${l.via.join('\n')}` })),
)
const sites = computed(() => MAP.sites.map((s) => ({ ...s, project: projectById(projectOfNode(s.services[0]))! })))
</script>

<template>
  <article>
    <h1>{{ t.overview }}</h1>
    <DocSections v-if="intro" :sections="intro[lang] ?? []" :lang="lang" />

    <SystemMap :nodes="nodes" :arrows="arrows" :label="t.overview" />
    <ul class="map-legend" :aria-label="t.legend">
      <li class="legend-arrow">{{ t.legendArrow }}</li>
      <li class="legend-pc">{{ t.legendPc }}</li>
      <li class="legend-external">{{ t.legendExternal }}</li>
    </ul>

    <h2>{{ t.sites }}</h2>
    <div class="doc-table-wrap">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t.domain }}</th>
            <th>{{ t.project }}</th>
            <th>{{ t.access }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sites" :key="s.domain">
            <td dir="ltr"><a :href="`https://${s.domain}/`" rel="noopener">{{ s.domain }}</a></td>
            <td><RouterLink :to="`/projects/${lang}/${s.project.id}`">{{ s.project.name }}</RouterLink></td>
            <td>
              <span :class="['access', s.private ? 'is-private' : 'is-public']">{{ s.private ? t.private : t.public }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>{{ t.mapHow }}</h2>
    <p>{{ t.mapHowBody }}</p>
    <p>{{ t.sources }}:</p>
    <ul class="doc-refs">
      <li v-for="s in MAP.sources" :key="s"><code dir="ltr">{{ s }}</code></li>
      <li><code dir="ltr">scripts/project-map.mjs</code></li>
    </ul>
  </article>
</template>
