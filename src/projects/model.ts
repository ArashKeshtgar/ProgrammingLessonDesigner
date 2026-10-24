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
}
export interface DocSection {
  id: string
  h: string
  p?: string[]
  list?: string[]
  examples?: string[]
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

// --- pages and their order (sidebar, previous / next) -----------------------------
export type PageGroup = 'overview' | 'server' | 'pc' | 'external' | 'infra' | 'about'
export interface Page {
  id: string
  group: PageGroup
  project?: MapProject
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
      .map((p) => ({ id: p.id, group: g, project: p })),
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
