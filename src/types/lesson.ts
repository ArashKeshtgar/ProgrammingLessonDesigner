export type Lang = 'csharp' | 'typescript' | 'python' | 'java'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'csharp', label: 'C#' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
]

// One concept, four languages. `diff` is the one-line "what really differs".
export interface CompareRow {
  concept: string
  csharp: string
  typescript: string
  python: string
  java: string
  diff: string
}

// Samples sharing a `group` render as one tabbed block (C# / TS / Python / Java).
export interface CodeSample {
  group: string
  lang: Lang
  title: string
  code: string
  // Where this sample comes from: 'real' = shortened from a project file (see refs),
  // 'port' = written for this lesson as the equivalent.
  origin: 'real' | 'port'
}

export interface Pitfall {
  lang: Lang | 'all'
  mistake: string
  why: string
  fix: string
}

// A pointer into a real project. `file` is relative to the project folder.
export interface CodeRef {
  project: string
  file: string
  line?: number
  note: string
}

export interface Exercise {
  q: string
  hint?: string
  a: string
}

export interface Concept {
  h: string
  body: string
}

export interface Lesson {
  _id: string
  n: number
  // Booklet the lesson belongs to: backend, frontend, docker, ...
  tag: string
  topics: string[]
  en: string
  fa: string
  goal: string[]
  story: string
  why: [string, string][]
  concepts: Concept[]
  compare: CompareRow[]
  code: CodeSample[]
  pitfalls: Pitfall[]
  refs: CodeRef[]
  exercises: Exercise[]
  take: string
}

export interface LessonIndexEntry {
  id: string
  n: number
  tag: string
  en: string
  fa: string
}
