<script setup lang="ts">
import { computed } from 'vue'
import { STRINGS, type DocLang } from '../../projects/i18n'
import type { CodeSnapshot, DocData } from '../../projects/model'

// Tables read from the project's code by scripts/project-code.mjs: they change
// when the code does, and never disagree with it.
const props = defineProps<{ data: DocData; code: CodeSnapshot; lang: DocLang }>()
const t = computed(() => STRINGS[props.lang])
const keep = (name: string) => !props.data.only || props.data.only.includes(name)

const endpoints = computed(() => props.code.endpoints.filter((e) => keep(e.area)))
const tables = computed(() => props.code.tables.filter((x) => keep(x.table)))
</script>

<template>
  <div class="data-table">
    <div v-if="data.kind === 'endpoints'" class="doc-table-wrap">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t.method }}</th>
            <th>{{ t.path }}</th>
            <th>{{ t.who }}</th>
            <th>{{ t.source }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in endpoints" :key="e.method + e.path + e.area">
            <td dir="ltr"><span :class="['http', `http-${e.method.toLowerCase()}`]">{{ e.method }}</span></td>
            <td dir="ltr"><code>{{ e.path }}</code></td>
            <td>{{ t.accessOf[e.access] ?? e.access }}</td>
            <td dir="ltr"><code class="muted">{{ e.handler ? `${e.handler}() ` : '' }}{{ e.file.split('/').at(-1) }}:{{ e.line }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <template v-else-if="data.kind === 'tables'">
      <div v-for="x in tables" :key="x.table" class="sql-table">
        <h3 dir="ltr">{{ x.database }}.dbo.{{ x.table }}</h3>
        <div class="doc-table-wrap">
          <table class="doc-table">
            <thead>
              <tr>
                <th>{{ t.column }}</th>
                <th>{{ t.type }}</th>
                <th>{{ t.nullable }}</th>
                <th>{{ t.notes }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in x.columns" :key="c.name">
                <td dir="ltr"><code>{{ c.name }}</code></td>
                <td dir="ltr"><code>{{ c.type }}</code></td>
                <td>{{ c.nullable ? t.yes : t.no }}</td>
                <td dir="ltr"><code v-for="n in c.notes" :key="n" class="note">{{ n }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="x.denies.length" class="muted">
          {{ t.denied }}: <code v-for="d in x.denies" :key="d" dir="ltr">{{ d }}</code>
        </p>
      </div>
    </template>

    <div v-else-if="data.kind === 'routes'" class="doc-table-wrap">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ t.path }}</th>
            <th>{{ t.page }}</th>
            <th>{{ t.guards }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in code.routes" :key="r.path">
            <td dir="ltr"><code>{{ r.path }}</code></td>
            <td>
              <code v-if="r.component" dir="ltr">{{ r.component }}</code>
              <span v-else>{{ t.redirectsTo }} <code dir="ltr">{{ r.redirect }}</code></span>
            </td>
            <td dir="ltr"><code v-for="g in r.guards" :key="g" class="note">{{ g }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="data-note">{{ t.readFromCode }}</p>
  </div>
</template>
