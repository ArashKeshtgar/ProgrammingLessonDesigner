import type { Lesson } from '../types/lesson'
import { BACKEND_LANGS, LANG_LABELS } from '../types/lesson'

export interface Card {
  id: string
  lesson: string
  kind: 'compare' | 'pitfall' | 'exercise'
  front: string
  hint?: string
  back: string[]
}

// Every lesson turns into cards: each compare row (from the known language to the others),
// each common mistake, each exercise.
export function cardsFor(lesson: Lesson): Card[] {
  const langs = lesson.langs ?? BACKEND_LANGS
  const known = lesson.known ?? 'csharp'
  const compare = lesson.compare.map((r, i): Card => ({
    id: `${lesson._id}:c${i}`,
    lesson: lesson._id,
    kind: 'compare',
    front: r.concept,
    hint: r[known] ? `${LANG_LABELS[known]}: ${r[known]}` : undefined,
    back: [...langs.filter((l) => l !== known && r[l]).map((l) => `${LANG_LABELS[l]}: ${r[l]}`), r.diff],
  }))
  const pitfalls = lesson.pitfalls.map((p, i): Card => ({
    id: `${lesson._id}:p${i}`,
    lesson: lesson._id,
    kind: 'pitfall',
    front: `${p.mistake} — چه اشکالی دارد؟`,
    back: [p.why, `درست: ${p.fix}`],
  }))
  const exercises = lesson.exercises.map((e, i): Card => ({
    id: `${lesson._id}:e${i}`,
    lesson: lesson._id,
    kind: 'exercise',
    front: e.q,
    hint: e.hint,
    back: [e.a],
  }))
  return [...compare, ...pitfalls, ...exercises]
}

// Leitner boxes: a right answer moves a card up a box (longer wait), a wrong one back to box 1.
const INTERVAL_DAYS = [0, 1, 3, 7, 16, 35]
const KEY = 'pld-review-v1'
const DAY = 24 * 60 * 60 * 1000

export interface CardState {
  box: number
  due: number
}

export function loadState(): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {} // storage blocked or corrupted: start fresh, the page still works
  }
}

function saveState(state: Record<string, CardState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // private mode / blocked storage: progress just isn't kept
  }
}

export function grade(state: Record<string, CardState>, id: string, knew: boolean, now = Date.now()) {
  const box = knew ? Math.min((state[id]?.box ?? 0) + 1, INTERVAL_DAYS.length - 1) : 1
  state[id] = { box, due: now + INTERVAL_DAYS[box] * DAY }
  saveState(state)
}

export function dueCards(cards: Card[], state: Record<string, CardState>, now = Date.now(), newPerDay = 15): Card[] {
  const due = cards.filter((c) => state[c.id] && state[c.id].due <= now)
  const fresh = cards.filter((c) => !state[c.id]).slice(0, newPerDay)
  return [...due, ...fresh]
}

export function resetState() {
  saveState({})
}
