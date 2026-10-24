// Snapshots what the topic pages of a project show from its real repo, so the site
// builds (and CI checks) without that repo: the code excerpts the pages quote, the
// length of every file they list, and tables read from the code itself: HTTP
// endpoints (NestJS controllers, Express apps), SQL tables, Angular routes.
//
//   npm run code            regenerate src/data/topics/<project>.code.json
//   npm run code -- --check fail if a snapshot no longer matches its repo
//
// Excerpts are found by text (`from` / `to`: the first line containing each), not by
// line number, so an edit elsewhere in the file does not move them. The repos are
// only read.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectsRoot = process.env.LESSON_REFS_ROOT || 'D:/E/Projects'
const topicsDir = path.join(root, 'src', 'data', 'topics')
const check = process.argv.includes('--check')
const problems = []

if (!existsSync(projectsRoot)) {
  // CI has no checkout of the projects: the committed snapshots are used as they are.
  console.log(`project code: ${projectsRoot} not found, skipped`)
  process.exit(0)
}

const lines = (text) => text.replace(/\r\n/g, '\n').split('\n')
const walk = (dir, test) =>
  readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) return []
    const p = path.join(dir, name)
    return statSync(p).isDirectory() ? walk(p, test) : test(name) ? [p] : []
  })

function dedent(ls) {
  const indent = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length))
  return ls.map((l) => l.slice(indent)).join('\n')
}

// --- tables read from the code ---------------------------------------------------

// NestJS: @Controller('prefix') on the class, then per method an HTTP decorator,
// optional @Roles(...) and @UseGuards(...), then the method itself.
function nestEndpoints(repo, dir) {
  const out = []
  for (const file of walk(path.join(repo, dir), (n) => n.endsWith('.controller.ts'))) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const src = lines(readFileSync(file, 'utf-8'))
    const classAt = src.findIndex((l) => /^export class \w+Controller/.test(l))
    const head = src.slice(0, classAt).join('\n')
    const prefix = /@Controller\('([^']*)'\)/.exec(head)?.[1] ?? ''
    const classGuards = /@UseGuards\(([^)]*)\)/.exec(head)?.[1] ?? ''
    let pending = null
    src.slice(classAt + 1).forEach((l, i) => {
      const http = /^\s+@(Get|Post|Put|Delete|Patch)\((?:'([^']*)')?/.exec(l)
      if (http) pending = { method: http[1].toUpperCase(), sub: http[2] ?? '', roles: [], guards: '', line: classAt + 2 + i }
      else if (pending && /^\s+@Roles\(/.test(l)) pending.roles = [...l.matchAll(/'(\w+)'/g)].map((m) => m[1])
      else if (pending && /^\s+@UseGuards\(/.test(l)) pending.guards = l
      else if (pending && /^\s+(?:async\s+)?(\w+)\(/.test(l) && !/^\s+@/.test(l)) {
        const guarded = /JwtAuthGuard/.test(classGuards + pending.guards)
        out.push({
          area: prefix || 'root',
          method: pending.method,
          path: '/' + [prefix, pending.sub].filter(Boolean).join('/'),
          access: pending.roles.length ? pending.roles.join(', ') : guarded ? 'signed-in' : 'public',
          handler: /^\s+(?:async\s+)?(\w+)\(/.exec(l)[1],
          file: rel,
          line: pending.line,
        })
        pending = null
      }
    })
  }
  return out
}

// Express: app.get('/path', ...) in each adapter's app.ts. Adapters publish no port,
// so their routes are reachable from inside the Docker network only.
function expressEndpoints(repo, dir) {
  return walk(path.join(repo, dir), (n) => n === 'app.ts').flatMap((file) => {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    return lines(readFileSync(file, 'utf-8')).flatMap((l, i) => {
      const m = /app\.(get|post|put|delete)\('([^']+)'/.exec(l)
      return m
        ? [{ area: rel.split('/').at(-3), method: m[1].toUpperCase(), path: m[2], access: 'internal', file: rel, line: i + 1 }]
        : []
    })
  })
}

// SQL Server: CREATE TABLE blocks (columns, keys, defaults, checks) and DENY grants.
function sqlTables(repo, dir) {
  const out = []
  for (const file of walk(path.join(repo, dir), (n) => n.endsWith('.sql')).sort()) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const src = lines(readFileSync(file, 'utf-8'))
    let db = null
    src.forEach((l, i) => {
      const use = /^USE (\w+);/.exec(l)
      if (use) db = use[1]
      const create = /CREATE TABLE dbo\.(\w+) \(/.exec(l)
      if (create) {
        const columns = []
        for (let j = i + 1; j < src.length && !/^\s*\);/.test(src[j]); j++) {
          const c = /^\s*\[?(\w+)\]?\s+([A-Z0-9]+(?:\(\d+(?:,\s*\d+)?\))?)(.*?),?\s*$/.exec(src[j])
          if (!c) continue
          const rest = c[3]
          const notes = []
          if (/PRIMARY KEY/.test(rest)) notes.push('PK')
          if (/IDENTITY/.test(c[2] + rest)) notes.push('identity')
          if (/UNIQUE/.test(rest)) notes.push('unique')
          const def = /DEFAULT \((.+?)\)\s*$/.exec(rest)?.[1]
          if (def) notes.push(`default ${def}`)
          const ck = /CHECK \((.+)\)/.exec(rest)?.[1]
          if (ck) notes.push(`check ${ck}`)
          columns.push({ name: c[1], type: c[2], nullable: !/NOT NULL/.test(rest), notes })
        }
        out.push({ database: db, table: create[1], file: rel, line: i + 1, columns, denies: [] })
      }
      const deny = /DENY (.+) ON dbo\.(\w+) TO (\w+)/.exec(l)
      if (deny) out.find((t) => t.table === deny[2])?.denies.push(`${deny[1]} to ${deny[3]}`)
    })
  }
  return out
}

// Angular: { path: '...', component: X, canActivate: [...] } or a redirect.
function angularRoutes(repo, file) {
  return lines(readFileSync(path.join(repo, file), 'utf-8')).flatMap((l) => {
    const m = /\{ path: '([^']*)', (?:redirectTo: '([^']*)'|component: (\w+))(?:, canActivate: \[([^\]]*)\])?/.exec(l)
    if (!m) return []
    return [{ path: '/' + m[1], ...(m[2] !== undefined ? { redirect: '/' + m[2] } : { component: m[3] }), guards: m[4] ? m[4].split(',').map((s) => s.trim()) : [] }]
  })
}

// --- one project -----------------------------------------------------------------
function snapshot(topics) {
  const repo = path.join(projectsRoot, topics.repo)
  const at = (m) => problems.push(`${topics.project}: ${m}`)
  const read = (f) => {
    const p = path.join(repo, f)
    if (!existsSync(p)) {
      at(`file not found: ${topics.repo}/${f}`)
      return null
    }
    return lines(readFileSync(p, 'utf-8'))
  }

  const files = {}
  for (const page of topics.pages)
    for (const f of page.files ?? []) {
      const src = read(f)
      if (src) files[f] = src.length - (src.at(-1) === '' ? 1 : 0)
    }

  const examples = {}
  for (const page of topics.pages)
    for (const [id, ex] of Object.entries(page.examples ?? {})) {
      if (!ex.file) continue
      const src = read(ex.file)
      if (!src) continue
      const start = src.findIndex((l) => l.includes(ex.from))
      if (start < 0) {
        at(`${page.id}/${id}: "${ex.from}" not found in ${ex.file}`)
        continue
      }
      // `to`: up to the first line after `from` that contains it; `lines`: that many lines.
      const end = ex.lines ? start + ex.lines - 1 : ex.to ? src.findIndex((l, i) => i >= start && l.includes(ex.to)) : start
      if (end < 0 || end >= src.length) {
        at(`${page.id}/${id}: "${ex.to}" not found after "${ex.from}" in ${ex.file}`)
        continue
      }
      examples[`${page.id}/${id}`] = { file: ex.file, start: start + 1, end: end + 1, code: dedent(src.slice(start, end + 1)) }
    }

  const s = topics.scan ?? {}
  return {
    project: topics.project,
    repo: topics.repo,
    files,
    examples,
    endpoints: [
      ...(s.nestControllers ?? []).flatMap((d) => nestEndpoints(repo, d)),
      ...(s.expressApps ?? []).flatMap((d) => expressEndpoints(repo, d)),
    ],
    tables: (s.sql ?? []).flatMap((d) => sqlTables(repo, d)),
    routes: s.angularRoutes ? angularRoutes(repo, s.angularRoutes) : [],
  }
}

let written = 0
for (const f of readdirSync(topicsDir).filter((x) => x.endsWith('.json') && !x.endsWith('.code.json'))) {
  const topics = JSON.parse(readFileSync(path.join(topicsDir, f), 'utf-8'))
  const json = JSON.stringify(snapshot(topics), null, 2) + '\n'
  const out = path.join(topicsDir, f.replace(/\.json$/, '.code.json'))
  if (check) {
    const committed = existsSync(out) ? readFileSync(out, 'utf-8').replace(/\r\n/g, '\n') : ''
    if (committed !== json) problems.push(`${path.basename(out)} is out of date with ${topics.repo}; run npm run code`)
  } else {
    writeFileSync(out, json)
    written++
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(check ? 'project code ok' : `wrote ${written} snapshot(s)`)
