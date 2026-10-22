<script setup lang="ts">
import { LANG_LABELS, type CompareRow, type Lang } from '../types/lesson'

defineProps<{ rows: CompareRow[]; langs: Lang[]; known: Lang }>()
</script>

<template>
  <!-- Wide screens: a table. Phones: one card per concept (see app.css), no sideways scrolling. -->
  <div class="compare-wrap">
    <table class="compare">
      <thead>
        <tr>
          <th>مفهوم</th>
          <th v-for="l in langs" :key="l" :class="{ known: l === known }">{{ LANG_LABELS[l] }}</th>
          <th>تفاوت واقعی</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.concept">
          <th scope="row">{{ r.concept }}</th>
          <td v-for="l in langs" :key="l" dir="ltr" :class="{ known: l === known }" :data-label="LANG_LABELS[l]">
            <code>{{ r[l] }}</code>
          </td>
          <td class="diff" data-label="تفاوت">{{ r.diff }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
