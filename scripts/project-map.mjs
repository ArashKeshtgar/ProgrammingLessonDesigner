// Builds src/data/project-map.json, the map of the Projects tab, from the files that
// really run the portfolio: Control Panel's compose files, the VPS overlay, the
// Caddyfile and the VPS env template. It only reads them.
//
//   npm run map            regenerate (needs the projects folder, LESSON_REFS_ROOT)
//   npm run map -- --check fail if the committed map no longer matches those files
//
// What it finds: which project each service belongs to, what each service talks to
// (host names in its environment, depends_on), other projects reached over URLs,
// and which domain Caddy sends to which service, public or behind basic auth.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectsRoot = process.env.LESSON_REFS_ROOT || 'D:/E/Projects'
const cp = path.join(projectsRoot, 'ControlPanel')
const out = path.join(root, 'src', 'data', 'project-map.json')
const check = process.argv.includes('--check')

const SOURCES = {
  base: 'docker-compose.yml',
  apps: 'compose.apps.yml',
  vps: 'deploy/vps/compose.vps.yml',
  caddy: 'deploy/vps/Caddyfile',
  env: 'deploy/vps/.env.vps.example',
}

// Projects by the .env variable that points compose at their repo folder.
const BY_DIR_VAR = {
  LEDGERDASH_DIR: 'ledgerdashboard',
  REBIOMED_DIR: 'rebiomed',
  LABFLOW_DIR: 'labflow',
  LESSONS_DIR: 'languagelessondesigner',
  PROGRAMMING_DIR: 'programminglessondesigner',
  CLINICREPORT_DIR: 'clinicreport',
  ANALYTICS_DIR: 'analytics',
  INTEGRATIONHUB_DIR: 'integrationhub',
}
// Services that run a stock image and say nothing about their project.
const BY_SERVICE = { caddy: 'edge', sqlserver: 'shared', 'socket-proxy': 'controlpanel' }
const BY_PREFIX = { 'rebiomed-': 'rebiomed', 'integrationhub-': 'integrationhub', 'analytics-': 'analytics' }
// Other projects named in environment variable names (HUB_ROUTE_CLINICHUB_UPSTREAM ...).
const BY_ENV_TOKEN = {
  CLINICHUB: 'clinichub',
  LABFLOW: 'labflow',
  CLINICREPORT: 'clinicreport',
  PHARMAFLOW: 'pharmaflow',
  FINANCE: 'financepowerapp',
  WUTILITY: 'wutility',
}
const PROJECTS = {
  edge: { name: 'Caddy', repo: 'ControlPanel' },
  shared: { name: 'SQL Server', repo: 'ControlPanel' },
  controlpanel: { name: 'Control Panel', repo: 'ControlPanel' },
  ledgerdashboard: { name: 'LedgerDashboard', repo: 'LedgerDashboard' },
  rebiomed: { name: 'ReBiomed', repo: 'Rebiomed' },
  labflow: { name: 'LabFlow', repo: 'LabFlow' },
  languagelessondesigner: { name: 'English lessons', repo: 'LanguageLessonDesigner' },
  programminglessondesigner: { name: 'Programming lessons', repo: 'ProgrammingLessonDesigner' },
  clinicreport: { name: 'ClinicReport', repo: 'ClinicReport' },
  analytics: { name: 'Analytics', repo: 'Analytics' },
  integrationhub: { name: 'IntegrationHub', repo: 'IntegrationHub' },
  clinichub: { name: 'ClinicHub', repo: 'ClinicHub' },
  wutility: { name: 'wUtility Web', repo: 'wUtility' },
  pharmaflow: { name: 'PharmaFlow', repo: 'PharmaFlow' },
  financepowerapp: { name: 'FinancePowerApp', repo: 'FinancePowerApp' },
}

if (!existsSync(cp)) {
  // CI has no checkout of Control Panel: the committed map is used as it is.
  console.log(`project map: ${cp} not found, skipped`)
  process.exit(0)
}

const read = (f) => readFileSync(path.join(cp, f), 'utf-8')
// Compose's own merge tags. !reset [] empties a list, !override replaces it.
const customTags = ['!reset', '!override'].flatMap((tag) => [
  { tag, collection: 'seq', resolve: (v) => v },
  { tag, collection: 'map', resolve: (v) => v },
])
const compose = (f) => parse(read(f), { customTags, merge: true }).services

// Compose overlays: later files win key by key; a list is replaced (as !reset/!override do).
function merge(a, b) {
  if (Array.isArray(b) || typeof b !== 'object' || b === null) return b ?? a
  const outv = { ...(a ?? {}) }
  for (const [k, v] of Object.entries(b)) outv[k] = merge(outv[k], v)
  return outv
}
const services = {}
for (const f of [SOURCES.base, SOURCES.apps, SOURCES.vps])
  for (const [name, def] of Object.entries(compose(f))) services[name] = merge(services[name], def)

const asList = (x) => (Array.isArray(x) ? x : x ? Object.keys(x) : [])
const envOf = (s) => {
  const e = s.environment
  if (Array.isArray(e)) return Object.fromEntries(e.map((x) => x.split(/=(.*)/s).slice(0, 2)))
  return Object.fromEntries(Object.entries(e ?? {}).map(([k, v]) => [k, String(v ?? '')]))
}
// ${VAR:-default} -> default, so the map shows what runs when .env says nothing.
const resolveDefaults = (v) => v.replace(/\$\{[A-Z0-9_]+(?::?-([^}]*))?\}/g, (_, d) => d ?? '')

// --- which project each service belongs to -------------------------------------
const builtImage = {}
for (const [name, s] of Object.entries(services)) if (s.build) builtImage[s.image ?? `controlpanel-${name}`] = name
function projectOf(name, seen = new Set()) {
  const s = services[name]
  if (BY_SERVICE[name]) return BY_SERVICE[name]
  const ctx = typeof s.build === 'string' ? s.build : s.build?.context
  if (ctx) {
    const dirVar = /\$\{([A-Z_]+_DIR)/.exec(ctx)?.[1]
    if (dirVar) return BY_DIR_VAR[dirVar] ?? fail(`no project for ${dirVar} (service ${name})`)
    if (ctx.startsWith('./') || ctx === '.') return 'controlpanel'
  }
  if (s.image && builtImage[s.image] && !seen.has(name)) return projectOf(builtImage[s.image], seen.add(name))
  if (asList(s.volumes).some((v) => String(v).startsWith('./'))) return 'controlpanel' // db-init runs ./db
  const prefix = Object.keys(BY_PREFIX).find((p) => name.startsWith(p))
  if (prefix) return BY_PREFIX[prefix]
  return fail(`no project for service ${name}`)
}
function fail(msg) {
  console.error(`project map: ${msg}`)
  process.exit(1)
}

function kindOf(name, s) {
  const image = s.image ?? ''
  if (/mssql|mongo|postgres/.test(image)) return 'database'
  if (/rabbitmq/.test(image)) return 'queue'
  if (name === 'caddy' || name === 'socket-proxy') return 'proxy'
  if (s.restart === 'no' || s.command?.includes?.('dist/seed/seedProducts.js')) return 'job'
  if (name === 'frontend' || name.endsWith('-web')) return 'web'
  return 'service'
}

const nodes = Object.entries(services)
  .map(([name, s]) => {
    const profiles = asList(s.profiles)
    const labels = s.labels ?? {}
    return {
      id: name,
      project: projectOf(name),
      kind: kindOf(name, s),
      // On the VPS only when no profile keeps it on the PC.
      vps: !profiles.length,
      ...(profiles.length ? { profiles } : {}),
      ...(labels['controlpanel.managed'] === 'true' ? { managed: labels['controlpanel.display'] } : {}),
    }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

// --- who talks to whom ---------------------------------------------------------
const names = Object.keys(services).sort((a, b) => b.length - a.length)
const dbName = (v) =>
  /Database=([\w]+)/i.exec(v)?.[1] ?? /(?:mongodb|postgresql):\/\/[^/]+\/(\w+)/.exec(v)?.[1] ?? null
const edges = new Map()
function link(from, to, label) {
  if (from === to) return
  const key = `${from}>${to}`
  const e = edges.get(key) ?? { from, to, labels: new Set() }
  if (label) e.labels.add(label)
  edges.set(key, e)
}
// Ports of other projects as the environment names them (5300 = ClinicHub), so a
// bare host.docker.internal:5300 elsewhere is ClinicHub too.
const portProject = {}
for (const s of Object.values(services))
  for (const [k, raw] of Object.entries(envOf(s))) {
    const token = Object.keys(BY_ENV_TOKEN).find((t) => k.includes(t))
    const port = /host\.docker\.internal:(\d+)/.exec(resolveDefaults(raw))?.[1]
    if (token && port) portProject[port] = BY_ENV_TOKEN[token]
  }

for (const [name, s] of Object.entries(services)) {
  const env = envOf(s)
  const own = projectOf(name)
  for (const [k, raw] of Object.entries(env)) {
    const v = resolveDefaults(raw)
    if (!v) continue
    let matched = false
    for (const other of names) {
      if (other === name) continue
      if (new RegExp(`(^|[^\\w-])${other}(?=$|[:/,;])`).test(v)) {
        const target = services[other]
        link(name, other, kindOf(other, target) === 'database' ? (dbName(v) ?? env.DB_NAME ?? null) : k)
        matched = true
      }
    }
    if (matched) continue
    const token = Object.keys(BY_ENV_TOKEN).find((t) => k.includes(t))
    const port = /host\.docker\.internal:(\d+)/.exec(v)?.[1]
    const target = token && /:\/\/|Server=/i.test(v) ? BY_ENV_TOKEN[token] : port ? portProject[port] : null
    if (target && target !== own) link(name, `project:${target}`, k)
  }
  for (const dep of asList(s.depends_on)) if (dep !== 'caddy') link(name, dep, null)
}

// --- the public face: Caddy's sites ---------------------------------------------
const envExample = Object.fromEntries(
  read(SOURCES.env)
    .split('\n')
    .map((l) => /^([A-Z_]+_DOMAIN)=(\S+)/.exec(l))
    .filter(Boolean)
    .map((m) => [m[1], m[2].split('.')[0]]),
)
const caddyEnv = envOf(services.caddy)
const baseDomain = Object.values(caddyEnv)
  .map((v) => /:-[a-z]+\.([a-z0-9.-]+)\}$/.exec(v)?.[1])
  .find(Boolean)
const sites = []
const caddyfile = read(SOURCES.caddy)
for (const m of caddyfile.matchAll(/^\{\$([A-Z_]+_DOMAIN)\} \{\n([\s\S]*?)\n\}/gm)) {
  const [, domainVar, body] = m
  const sub = envExample[domainVar] ?? /:-([a-z]+)\./.exec(caddyEnv[domainVar] ?? '')?.[1]
  const targets = [...body.matchAll(/reverse_proxy ([\w-]+):\d+/g)].map((x) => x[1])
  const files = /root \* /.test(body)
  for (const t of new Set(targets)) link('caddy', t, `${sub}.${baseDomain}`)
  sites.push({
    domain: `${sub}.${baseDomain}`,
    services: [...new Set(targets)],
    private: /import private/.test(body),
    ...(files ? { files: true } : {}),
  })
}
sites.sort((a, b) => a.domain.localeCompare(b.domain))

// --- projects and the links between them -----------------------------------------
const edgeList = [...edges.values()]
  .map((e) => ({ from: e.from, to: e.to, ...(e.labels.size ? { labels: [...e.labels].sort() } : {}) }))
  .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to))
const projectOfNode = (id) => (id.startsWith('project:') ? id.slice(8) : nodes.find((n) => n.id === id).project)
const projectIds = new Set([...nodes.map((n) => n.project), ...edgeList.map((e) => projectOfNode(e.to))])
const links = new Map()
function projectLink(a, b, via) {
  if (a === b) return
  const l = links.get(`${a}>${b}`) ?? { from: a, to: b, via: [] }
  if (!l.via.includes(via)) l.via.push(via)
  links.set(`${a}>${b}`, l)
}
// A database named after a project's repo (LedgerDashboard, LabFlow) is that
// project's data, whichever server it lives on: reading it links the two projects.
const dbOwner = (db) => Object.keys(PROJECTS).find((id) => PROJECTS[id].repo === db)
for (const e of edgeList) {
  const a = projectOfNode(e.from)
  projectLink(a, projectOfNode(e.to), e.to.startsWith('project:') ? e.from : `${e.from} → ${e.to}`)
  const target = nodes.find((n) => n.id === e.to)
  if (target?.kind === 'database')
    for (const db of e.labels ?? []) {
      const owner = dbOwner(db)
      if (owner) projectLink(a, owner, `${e.from} → ${db} database`)
    }
}
const projects = [...projectIds]
  .map((id) => {
    if (!PROJECTS[id]) fail(`no name for project ${id}; add it to PROJECTS`)
    const own = nodes.filter((n) => n.project === id)
    return {
      id,
      ...PROJECTS[id],
      // In compose (built and run with the rest) or only reached over the network.
      inCompose: own.length > 0,
      onVps: own.some((n) => n.vps),
      services: own.map((n) => n.id),
      domains: sites.filter((s) => s.services.some((x) => own.some((n) => n.id === x))).map((s) => s.domain),
    }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

const map = {
  // Where every fact below comes from (Control Panel repo, read only).
  sources: Object.values(SOURCES).map((f) => `ControlPanel/${f}`),
  projects,
  links: [...links.values()].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
  services: nodes,
  edges: edgeList,
  sites,
}
const json = JSON.stringify(map, null, 2) + '\n'

if (check) {
  const committed = existsSync(out) ? readFileSync(out, 'utf-8') : ''
  if (committed.replace(/\r\n/g, '\n') !== json) {
    console.error('project map: src/data/project-map.json is out of date with Control Panel; run npm run map')
    process.exit(1)
  }
  console.log(`project map ok (${projects.length} projects, ${nodes.length} services)`)
} else {
  writeFileSync(out, json)
  console.log(`wrote src/data/project-map.json (${projects.length} projects, ${nodes.length} services, ${edgeList.length} links)`)
}
