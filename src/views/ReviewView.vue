<script setup lang="ts">
import { computed, ref } from 'vue'
import { allLessons } from '../lib/lessons'
import { BOOKLETS } from '../lib/booklets'
import { cardsFor, dueCards, grade, loadState, resetState } from '../lib/review'

const state = ref(loadState())
const tag = ref('')
const all = computed(() => allLessons().filter((l) => !tag.value || l.tag === tag.value).flatMap(cardsFor))
const queue = ref(dueCards(all.value, state.value))
const index = ref(0)
const shown = ref(false)
const done = ref(0)

const card = computed(() => queue.value[index.value])
const learned = computed(() => all.value.filter((c) => (state.value[c.id]?.box ?? 0) >= 3).length)

function restart() {
  state.value = loadState()
  queue.value = dueCards(all.value, state.value)
  index.value = 0
  shown.value = false
}

function answer(knew: boolean) {
  if (!card.value) return
  grade(state.value, card.value.id, knew)
  if (!knew) queue.value.push(card.value) // see it again before the session ends
  done.value++
  index.value++
  shown.value = false
}

function pick(t: string) {
  tag.value = t
  restart()
}

function wipe() {
  if (!confirm('همه‌ی پیشرفت مرور پاک شود؟')) return
  resetState()
  restart()
}

const KIND = { compare: 'مقایسه', pitfall: 'اشتباه رایج', exercise: 'تمرین' }
</script>

<template>
  <main class="page review">
    <h1>مرور</h1>
    <p class="lead">
      کارت‌ها از جدول‌های مقایسه، اشتباه‌های رایج و تمرین‌های درس‌ها ساخته می‌شوند. جواب درست کارت را دیرتر برمی‌گرداند،
      جواب غلط فردا. پیشرفت فقط در همین مرورگر ذخیره می‌شود.
    </p>
    <div class="filters" role="group" aria-label="جزوه">
      <button :class="{ on: !tag }" @click="pick('')">همه</button>
      <button v-for="(b, t) in BOOKLETS" :key="t" :class="{ on: tag === t }" @click="pick(t)">{{ b.title }}</button>
    </div>
    <p class="stats">
      {{ all.length }} کارت · {{ learned }} یادگرفته · امروز: {{ queue.length - index }} مانده · {{ done }} انجام شده
    </p>

    <div v-if="card" class="card">
      <div class="card-kind">{{ KIND[card.kind] }} · {{ card.lesson }}</div>
      <p class="front">{{ card.front }}</p>
      <p v-if="card.hint" class="hint" dir="auto">{{ card.hint }}</p>
      <div v-if="shown" class="back">
        <p v-for="(b, i) in card.back" :key="i" dir="auto">{{ b }}</p>
      </div>
      <div class="card-actions">
        <button v-if="!shown" class="primary" @click="shown = true">نشان بده</button>
        <template v-else>
          <button class="primary" @click="answer(true)">بلد بودم</button>
          <button @click="answer(false)">بلد نبودم</button>
        </template>
      </div>
    </div>
    <div v-else class="card empty">
      <p>برای امروز کارتی نمانده.</p>
      <button @click="restart">دوباره بررسی کن</button>
    </div>

    <button class="btn-link danger" @click="wipe">پاک کردن پیشرفت</button>
  </main>
</template>
