import type { Lesson, LessonIndexEntry } from '../types/lesson'

const modules = import.meta.glob<{ default: Lesson }>('../data/lessons/*.json', { eager: true })

const lessons: Lesson[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.n - b.n)

export function allLessons(): Lesson[] {
  return lessons
}

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l._id === id)
}

export function listLessons(tag?: string): LessonIndexEntry[] {
  return lessons
    .filter((l) => !tag || l.tag === tag)
    .map((l) => ({ id: l._id, n: l.n, tag: l.tag, en: l.en, fa: l.fa }))
}

export function listTags(): string[] {
  return [...new Set(lessons.map((l) => l.tag))]
}
