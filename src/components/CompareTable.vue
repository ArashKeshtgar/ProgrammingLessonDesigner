<script setup lang="ts">
import { LANGS, type CompareRow } from '../types/lesson'

defineProps<{ rows: CompareRow[] }>()
</script>

<template>
  <div class="compare-wrap">
    <table class="compare">
      <thead>
        <tr>
          <th>مفهوم</th>
          <th v-for="l in LANGS" :key="l.id" :class="{ known: l.id === 'csharp' }">{{ l.label }}</th>
          <th>تفاوت واقعی</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.concept">
          <th scope="row">{{ r.concept }}</th>
          <td v-for="l in LANGS" :key="l.id" dir="ltr" :class="{ known: l.id === 'csharp' }">
            <code>{{ r[l.id] }}</code>
          </td>
          <td class="diff">{{ r.diff }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
