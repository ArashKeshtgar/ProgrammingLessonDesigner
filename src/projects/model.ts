import { shallowReactive } from 'vue'
import topicIndex from 'virtual:topic-index'
import mapJson from '../data/project-map.json'
import type { DocLang } from './i18n'

// --- the generated map (scripts/project-map.mjs) --------------------------------
export type ServiceKind = 'web' | 'service' | 'database' | 'queue' | 'proxy' | 'job'

export interface MapProject {
  id: string
  name: string
  repo: string
  inCompose: boolean
  onVps: boolean
  services: string[]
  domains: string[]
}
export interface MapService {
  id: string
  project: string
  kind: ServiceKind
  vps: boolean
  profiles?: string[]
  managed?: string
}
export interface MapEdge {
  from: string
  // a service id, or "project:<id>" for a project outside compose
  to: string
  labels?: string[]
}
export interface MapLink {
  from: string
  to: string
  via: string[]
}
export interface MapSite {
  domain: string
  services: string[]
  private: boolean
  files?: boolean
}
export interface ProjectMap {
  sources: string[]
  projects: MapProject[]
  links: MapLink[]
  services: MapService[]
  edges: MapEdge[]
  sites: MapSite[]
}

export const MAP = mapJson as ProjectMap

// --- hand-written content (src/data/projects/*.json) ------------------------------
// Code is the same in both languages, so examples sit beside the two texts and
// sections refer to them by id.
export interface DocExample {
  title: Record<DocLang, string>
  lang: string
  code?: string
  // or a region of a real file of this repo (the styling page shows its own Sass)
  file?: string
  region?: string
  // shown above the code: where a snapshot excerpt comes from (repo/file:lines)
  source?: string
}
// A table read from the project's code (scripts/project-code.mjs), filtered.
export interface DocData {
  kind: 'endpoints' | 'tables' | 'routes'
  // endpoints: controller prefixes / adapter names; tables: table names
  only?: string[]
}
export interface DocSection {
  id: string
  h: string
  p?: string[]
  list?: string[]
  examples?: string[]
  data?: DocData
}
export interface DocRef {
  project: string
  file: string
  line?: number
  note: Record<DocLang, string>
}
export interface DocContent {
  id: string
  summary?: Record<DocLang, string>
  fa?: DocSection[]
  en?: DocSection[]
  examples?: Record<string, DocExample>
  refs?: DocRef[]
}

const modules = import.meta.glob<{ default: DocContent }>('../data/projects/*.json', { eager: true })
const docs: Record<string, DocContent> = Object.fromEntries(
  Object.values(modules).map((m) => [m.default.id, m.default]),
)
export const doc = (id: string): DocContent | undefined => docs[id]

// --- a project's topics (src/data/topics/<project>.json) ---------------------------
// Each topic is one part of the project (a backend module, a frontend page, the
// tables...): its files, a short explanation in both languages, and excerpts of the
// real code, quoted from a snapshot taken by scripts/project-code.mjs.
export interface TopicExample {
  title: Record<DocLang, string>
  lang: string
  file: string
  from: string
  to?: string
  lines?: number
}
// The quiz at the end of a topic: the same questions in both languages.
export interface QuizQuestion {
  q: Record<DocLang, string>
  options: Record<DocLang, string[]>
  // index of the right option
  answer: number
  why: Record<DocLang, string>
}
export interface Topic {
  id: string
  group: string
  title: Record<DocLang, string>
  files?: string[]
  fa: DocSection[]
  en: DocSection[]
  examples?: Record<string, TopicExample>
  quiz?: QuizQuestion[]
}
export interface ProjectTopics {
  project: string
  repo: string
  groups: { id: string; title: Record<DocLang, string> }[]
  pages: Topic[]
}
// What is known of a topic before its project is loaded (virtual:topic-index, built
// by vite.config.ts): enough for the contents list, previous / next and search.
export interface TopicMeta {
  id: string
  group: string
  title: Record<DocLang, string>
  heads: Record<DocLang, string[]>
}
export interface TopicIndex {
  project: string
  groups: ProjectTopics['groups']
  pages: TopicMeta[]
}

export interface Endpoint {
  area: string
  method: string
  path: string
  access: string
  handler?: string
  file: string
  line: number
}
export interface SqlTable {
  database: string
  // EF Core tables live in named schemas; SQL scripts here use dbo
  schema?: string
  // SQLite: no schemas, the database is a file; MongoDB: a collection, its fields
  provider?: 'sqlite' | 'mongodb'
  table: string
  file: string
  line: number
  // nullable: null for a computed column (its expression decides)
  columns: { name: string; type: string; nullable: boolean | null; notes: string[] }[]
  denies: string[]
  checks?: string[]
  // UNIQUE over several columns (a constraint or a unique index)
  uniques?: string[]
  // MongoDB: Schema.index({...}) of the collection
  indexes?: string[]
}
export interface CodeSnapshot {
  repo: string
  files: Record<string, number>
  examples: Record<string, { file: string; start: number; end: number; code: string }>
  endpoints: Endpoint[]
  tables: SqlTable[]
  routes: { path: string; component?: string; redirect?: string; guards: string[] }[]
}

const INDEX: Record<string, TopicIndex> = Object.fromEntries(topicIndex.map((t) => [t.project, t]))
export const topicsOf = (project: string): TopicIndex | undefined => INDEX[project]

// The topics and code snapshot of a project are loaded the first time one of its
// topics is opened: a file per project, so the tab does not carry them all.
// File names are the project ids (scripts/check-projects.mjs checks it).
const topicFiles = import.meta.glob<ProjectTopics>(['../data/topics/*.json', '!../data/topics/*.code.json'], { import: 'default' })
const codeFiles = import.meta.glob<CodeSnapshot>('../data/topics/*.code.json', { import: 'default' })
export interface LoadedProject {
  topics: ProjectTopics
  code?: CodeSnapshot
}
const LOADED = shallowReactive<Record<string, LoadedProject>>({})
const loading: Record<string, Promise<LoadedProject>> = {}
export const loadedProject = (project: string): LoadedProject | undefined => LOADED[project]
export function loadProject(project: string): Promise<LoadedProject> {
  return (loading[project] ??= (async () => {
    const [topics, code] = await Promise.all([
      topicFiles[`../data/topics/${project}.json`](),
      codeFiles[`../data/topics/${project}.code.json`]?.(),
    ])
    return (LOADED[project] = { topics, code })
  })().catch((e) => {
    delete loading[project] // a failed download (offline) can be tried again
    throw e
  }))
}

// A topic's examples as the example box shows them: the snapshot's code, and where
// in the repo it comes from.
export function topicExamples(topic: Topic, code: CodeSnapshot | undefined): Record<string, DocExample> {
  return Object.fromEntries(
    Object.entries(topic.examples ?? {}).map(([id, ex]) => {
      const snap = code?.examples[`${topic.id}/${id}`]
      const lines = snap && snap.start !== snap.end ? `${snap.start}-${snap.end}` : snap?.start
      return [
        id,
        {
          title: ex.title,
          lang: ex.lang,
          code: snap?.code ?? `// missing snapshot: ${ex.file}`,
          source: `${code?.repo}/${ex.file}${lines ? `:${lines}` : ''}`,
        },
      ]
    }),
  )
}

// --- pages and their order (sidebar, previous / next) -----------------------------
export type PageGroup = 'overview' | 'server' | 'pc' | 'external' | 'infra' | 'about'
export interface Page {
  // "overview", "styling", a project id, or "<project>/<topic>"
  id: string
  group: PageGroup
  project?: MapProject
  topic?: TopicMeta
}

// The order a visitor meets them: the entry point first, then the rest by size.
const PRIORITY = ['controlpanel', 'ledgerdashboard', 'rebiomed', 'labflow', 'clinicreport']
const rank = (p: MapProject) => {
  const i = PRIORITY.indexOf(p.id)
  return i < 0 ? PRIORITY.length + 100 - p.services.length : i
}
function groupOf(p: MapProject): PageGroup {
  if (p.id === 'edge' || p.id === 'shared') return 'infra'
  if (!p.inCompose) return 'external'
  return p.onVps ? 'server' : 'pc'
}

export const PAGES: Page[] = [
  { id: 'overview', group: 'overview' },
  ...(['server', 'pc', 'external', 'infra'] as PageGroup[]).flatMap((g) =>
    MAP.projects
      .filter((p) => groupOf(p) === g)
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
      // A project's own page first, then its topics in the order they are written.
      .flatMap((p) => [
        { id: p.id, group: g, project: p },
        ...(INDEX[p.id]?.pages ?? []).map((topic) => ({ id: `${p.id}/${topic.id}`, group: g, project: p, topic })),
      ]),
  ),
  { id: 'styling', group: 'about' },
]

export const page = (id: string) => PAGES.find((p) => p.id === id)
export const projectById = (id: string) => MAP.projects.find((p) => p.id === id)
export const serviceById = (id: string) => MAP.services.find((s) => s.id === id)
export const projectOfNode = (id: string) => (id.startsWith('project:') ? id.slice(8) : serviceById(id)!.project)

export const linksFrom = (id: string) => MAP.links.filter((l) => l.from === id)
export const linksTo = (id: string) => MAP.links.filter((l) => l.to === id)
export const sitesOf = (p: MapProject) => MAP.sites.filter((s) => s.services.some((x) => p.services.includes(x)))
