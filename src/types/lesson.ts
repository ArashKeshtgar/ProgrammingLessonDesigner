export type Lang = 'csharp' | 'typescript' | 'python' | 'java' | 'blazor' | 'angular' | 'react' | 'vue'

export const LANG_LABELS: Record<Lang, string> = {
  csharp: 'C#',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  blazor: 'Blazor (C#)',
  angular: 'Angular',
  react: 'React',
  vue: 'Vue',
}

export const BACKEND_LANGS: Lang[] = ['csharp', 'typescript', 'python', 'java']

// One concept, several languages. `diff` is the one-line "what really differs".
export type CompareRow = { concept: string; diff: string } & Partial<Record<Lang, string>>

// Samples sharing a `group` render as one tabbed block, one tab per language.
// The code is either inline (`code`, for a quote from a real project) or read at build
// time from a tested file under examples/ (`file`, optionally cut to one `region`).
export interface CodeSample {
  group: string
  // 'all' = one sample that is the same for every language (a compose file); shown without tabs.
  lang: Lang | 'all'
  title: string
  // 'real' = shortened from a project file (see refs); 'tested' = a file under examples/
  // that the CI builds and tests; 'port' = written for the lesson, not run.
  origin: 'real' | 'tested' | 'port'
  code?: string
  file?: string
  region?: string
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
  // Booklet the lesson belongs to: backend, frontend, docker.
  tag: string
  topics: string[]
  // Columns of the compare table and tabs of the code blocks; defaults to the four backend languages.
  langs?: Lang[]
  // The column the reader already knows (highlighted); defaults to csharp.
  known?: Lang
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
