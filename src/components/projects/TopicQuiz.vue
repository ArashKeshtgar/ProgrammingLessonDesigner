<script setup lang="ts">
import { computed, ref } from 'vue'
import { STRINGS, inline, type DocLang } from '../../projects/i18n'
import type { QuizQuestion } from '../../projects/model'

// The exercise at the end of a topic: pick an option, see whether it is right and
// why. The first pick counts for the score; after that you may try the others.
const props = defineProps<{ quiz: QuizQuestion[]; lang: DocLang }>()
const emit = defineEmits<{ done: [] }>()
const t = computed(() => STRINGS[props.lang])

// per question: the options tried, in order
const tried = ref<number[][]>(props.quiz.map(() => []))
const answered = (i: number) => tried.value[i].includes(props.quiz[i].answer)
const allDone = computed(() => props.quiz.every((_, i) => answered(i)))
const firstTry = computed(() => props.quiz.filter((q, i) => tried.value[i][0] === q.answer).length)

function pick(i: number, o: number) {
  if (answered(i) || tried.value[i].includes(o)) return
  tried.value[i].push(o)
  if (allDone.value) emit('done')
}
const reset = () => (tried.value = props.quiz.map(() => []))
</script>

<template>
  <section class="quiz" :aria-label="t.quiz">
    <h2>{{ t.quiz }}</h2>
    <p class="muted">{{ t.quizIntro }}</p>
    <ol>
      <li v-for="(q, i) in quiz" :key="i" class="quiz-q">
        <p class="quiz-text" v-html="inline(q.q[lang])"></p>
        <div class="quiz-options" role="group" :aria-label="q.q[lang]">
          <button
            v-for="(o, j) in q.options[lang]"
            :key="j"
            type="button"
            :class="{ right: tried[i].includes(j) && j === q.answer, wrong: tried[i].includes(j) && j !== q.answer }"
            :aria-pressed="tried[i].includes(j)"
            :disabled="answered(i) && j !== q.answer"
            @click="pick(i, j)"
            v-html="inline(o)"
          ></button>
        </div>
        <p v-if="tried[i].length" class="quiz-why" :class="answered(i) ? 'right' : 'wrong'" aria-live="polite">
          <strong>{{ answered(i) ? t.right : t.wrong }}</strong>
          <span v-if="answered(i)" v-html="' ' + inline(q.why[lang])"></span>
        </p>
      </li>
    </ol>
    <p v-if="allDone" class="quiz-score">
      {{ t.score(firstTry, quiz.length) }}
      <button type="button" class="quiz-again" @click="reset">{{ t.quizAgain }}</button>
    </p>
  </section>
</template>
