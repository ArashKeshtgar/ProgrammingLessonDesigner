// Snapshots what the topic pages of a project show from its real repo, so the site
// builds (and CI checks) without that repo: the code excerpts the pages quote, the
// length of every file they list, and tables read from the code itself: HTTP
// endpoints (NestJS controllers, Express apps, ASP.NET Core Minimal APIs), SQL tables (scripts or
// EF Core model snapshots), Angular and React routes.
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
    // bin, obj (.NET) and target (Maven) hold build output, copies of the sources among it.
    if (['node_modules', 'dist', 'bin', 'obj', 'target'].includes(name) || name.startsWith('.')) return []
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

// SQL Server: CREATE TABLE blocks (columns, keys, defaults, checks, references), unique indexes
// and DENY grants. Tables in a schema other than dbo carry it; the database is the script's USE,
// or the scan entry's own ({ dir, database }) for scripts run against a database they don't name.
function sqlTables(repo, entry) {
  const { dir, database } = typeof entry === 'string' ? { dir: entry } : entry
  const out = []
  const find = (schema, table) => out.find((t) => t.table === table && (t.schema ?? 'dbo') === schema)
  for (const file of walk(path.join(repo, dir), (n) => n.endsWith('.sql')).sort()) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const src = lines(readFileSync(file, 'utf-8'))
    let db = database ?? null
    src.forEach((l, i) => {
      const use = /^USE (\w+);/.exec(l)
      if (use) db = use[1]
      const create = /CREATE TABLE (\w+)\.(\w+) \(/.exec(l)
      if (create) {
        const columns = []
        const checks = []
        // Parentheses opened on a line and closed on a later one (a CHECK's list): one logical line.
        const depth = (s) => [...s.replace(/'[^']*'|--.*$/g, '')].reduce((d, ch) => d + (ch === '(') - (ch === ')'), 0)
        for (let j = i + 1; j < src.length && !/^\s*\)/.test(src[j]); j++) {
          let line = src[j]
          while (depth(line) > 0 && j + 1 < src.length) line = line.replace(/\s*--.*$/, '') + ' ' + src[++j].trim()
          // A table-level constraint: only CHECKs are kept (keys show on their columns).
          const tc = /^\s*CONSTRAINT \w+ CHECK \((.+)\),?\s*$/.exec(line)
          if (tc) checks.push(tc[1])
          const c = /^\s*\[?(\w+)\]?\s+([A-Za-z0-9]+(?:\(\s*(?:\d+|max)(?:,\s*\d+)?\))?)(?=[\s,]|$)(.*?),?\s*$/.exec(line)
          if (!c || /^(CONSTRAINT|PERIOD|PRIMARY|UNIQUE|CHECK|FOREIGN|INDEX)$/i.test(c[1])) continue
          const rest = c[3].replace(/\s*--.*$/, '')
          const notes = []
          if (/PRIMARY KEY/.test(rest)) notes.push('PK')
          if (/IDENTITY/.test(c[2] + rest)) notes.push('identity')
          if (/UNIQUE/.test(rest)) notes.push('unique')
          const def = /DEFAULT \((.+?)\)\s*$/.exec(rest)?.[1] ?? /DEFAULT ('[^']*'|[\w.]+(?:\(\))?)/.exec(rest)?.[1]
          if (def) notes.push(`default ${def}`)
          const ref = /REFERENCES (\w+)\.(\w+)/.exec(rest)
          if (ref) notes.push(`→ ${ref[1] === 'dbo' ? '' : ref[1] + '.'}${ref[2]}`)
          const ck = /CHECK \((.+)\)/.exec(rest)?.[1]
          if (ck) notes.push(`check ${ck}`)
          // A key column is never null, whether or not it says NOT NULL.
          columns.push({ name: c[1], type: c[2].toUpperCase(), nullable: !/NOT NULL|PRIMARY KEY/.test(rest), notes })
        }
        out.push({
          database: db,
          ...(create[1] === 'dbo' ? {} : { schema: create[1] }),
          table: create[2],
          file: rel,
          line: i + 1,
          columns,
          denies: [],
          ...(checks.length ? { checks } : {}),
        })
      }
      // A unique index on one column, filtered or not, is a note on that column.
      const ux = /CREATE UNIQUE (?:NONCLUSTERED )?INDEX \w+ ON (\w+)\.(\w+) \((\w+)\)(?: WHERE (.+?))?;?\s*$/.exec(l)
      if (ux) find(ux[1], ux[2])?.columns.find((c) => c.name === ux[3])?.notes.push(ux[4] ? `unique where ${ux[4]}` : 'unique')
      const deny = /DENY (.+) ON (\w+)\.(\w+) TO (\w+)/.exec(l)
      if (deny) find(deny[2], deny[3])?.denies.push(`${deny[1]} to ${deny[4]}`)
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

// ASP.NET Core Minimal APIs: `var api = app.MapGroup("/prefix")`, then `api.MapGet("/sub", ...)`
// (or MapMethods with a list of verbs), each ending with .RequireAuthorization(policy) or
// .AllowAnonymous(). With neither, the group's policy, else the fallback policy: signed in when the
// project sets one (SetFallbackPolicy), public when it doesn't. Policies are the C# constants they
// name (Permissions.BillingView → "billing.view", nameof(FrontDesk) → "FrontDesk"), found by class
// and name first, since two classes may both have a FrontDesk. The area is the OpenAPI tag
// (.WithTags) of the endpoint or its group, else the file name.
function aspnetEndpoints(repo, dir) {
  const files = walk(path.join(repo, dir), (n) => n.endsWith('.cs'))
  const constants = {}
  let fallback = 'public'
  for (const file of files) {
    let cls = null
    for (const l of lines(readFileSync(file, 'utf-8'))) {
      cls = /\bclass (\w+)/.exec(l)?.[1] ?? cls
      const m = /const string (\w+) = (?:"([^"]*)"|nameof\((\w+)\))/.exec(l)
      if (m) constants[`${cls}.${m[1]}`] = constants[m[1]] = m[2] ?? m[3]
      if (/SetFallbackPolicy\(/.test(l)) fallback = 'signed-in'
    }
  }
  const policy = (expr) => {
    const parts = expr.trim().split('.')
    return constants[parts.slice(-2).join('.')] ?? constants[parts.at(-1)] ?? expr.trim()
  }
  const AUTH = /\.(?:RequireAuthorization\(([^)]*)\)|AllowAnonymous\(\))/
  const TAG = /\.WithTags\("([^"]+)"\)/

  const out = []
  for (const file of files) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const src = lines(readFileSync(file, 'utf-8'))
    const groups = {}
    const found = []
    src.forEach((l, i) => {
      const g = /var (\w+) = (\w+)\.MapGroup\("([^"]*)"\)/.exec(l)
      if (g) {
        const parent = groups[g[2]]
        const auth = AUTH.exec(l)
        groups[g[1]] = {
          prefix: (parent?.prefix ?? '') + g[3],
          access: auth ? (auth[1] ? policy(auth[1]) : 'public') : parent?.access,
          tag: TAG.exec(l)?.[1] ?? parent?.tag,
        }
        found.push({ line: i, group: true })
        return
      }
      const m = /(\w+)\.Map(Get|Post|Put|Delete|Patch)\("([^"]*)"(?:,\s*(\w+)\))?/.exec(l)
      const mm = /(\w+)\.MapMethods\("([^"]*)", \[([^\]]*)\](?:,\s*(?:\([^)]*\))?(\w+)\))?/.exec(l)
      if (m) found.push({ line: i, on: m[1], methods: [m[2].toUpperCase()], sub: m[3], handler: m[4] })
      else if (mm) found.push({ line: i, on: mm[1], methods: [...mm[3].matchAll(/"(\w+)"/g)].map((x) => x[1]), sub: mm[2], handler: mm[4] })
    })
    found.forEach((e, k) => {
      if (e.group) return
      // The endpoint's own policy is on its last line: the first one, before the next endpoint, that names one.
      const until = found[k + 1]?.line ?? src.length
      const auth = src.slice(e.line, until).map((l) => AUTH.exec(l)).find(Boolean)
      const tag = src.slice(e.line, until).map((l) => TAG.exec(l)?.[1]).find(Boolean)
      const group = groups[e.on]
      const access = auth ? (auth[1] ? policy(auth[1]) : 'public') : group?.access ?? fallback
      const full = ((group?.prefix ?? '') + e.sub).replace(/(.)\/$/, '$1') || '/'
      for (const method of e.methods)
        out.push({
          area: tag ?? group?.tag ?? path.basename(file, '.cs').replace(/Endpoints$/, ''),
          method,
          path: full,
          access,
          ...(e.handler ? { handler: e.handler } : {}),
          file: rel,
          line: e.line + 1,
        })
    })
  }
  return out
}

// React Router: <Route path="..." element={<Page />} />, or a <Navigate> to a fixed path
// (a target computed from the user's permissions shows as Navigate). A page behind a check,
// element={can(me, 'users.manage') ? <Users /> : <Navigate to="/" />}, is that page with the
// permission as its guard.
function reactRoutes(repo, file) {
  return lines(readFileSync(path.join(repo, file), 'utf-8')).flatMap((l) => {
    const guarded = /<Route path="([^"]*)" element=\{(.+?) \? <(\w+)/.exec(l)
    if (guarded) {
      const perm = /can\(\w+, '([^']+)'\)/.exec(guarded[2])?.[1]
      return [{ path: guarded[1], component: guarded[3], guards: [perm ?? guarded[2]] }]
    }
    const m = /<Route path="([^"]*)" element=\{<(\w+)/.exec(l)
    if (!m) return []
    const to = m[2] === 'Navigate' ? /\bto="([^"]*)"/.exec(l)?.[1] : undefined
    return [{ path: m[1], ...(to !== undefined ? { redirect: to } : { component: m[2] }), guards: [] }]
  })
}

// EF Core: the model snapshot of each DbContext (Migrations/*ModelSnapshot.cs), which is what
// the migrations build. One modelBuilder.Entity block per table with its properties, keys,
// unique indexes and checks; later blocks of the same entity add its foreign keys.
// SQLite ({ provider: 'sqlite' }) has no schemas and few types (TEXT, INTEGER, REAL), so a
// column also notes its length, its collation and the C# type it holds (DateTime as TEXT...).
function efTables(repo, { file, database, provider }) {
  const sqlite = provider === 'sqlite'
  const src = lines(readFileSync(path.join(repo, file), 'utf-8'))
  const rel = file.replace(/\\/g, '/')
  // A chained statement from line i to the line that ends it (`;`).
  const statement = (i) => {
    let j = i
    while (j < src.length && !src[j].trimEnd().endsWith(';')) j++
    return src.slice(i, j + 1).join(' ')
  }
  const blocks = []
  src.forEach((l, i) => {
    const m = /^\s*modelBuilder\.Entity\("([\w.]+)", b =>/.exec(l)
    if (m) blocks.push({ entity: m[1], start: i })
  })
  blocks.forEach((b, k) => (b.end = blocks[k + 1]?.start ?? src.length))

  const tables = {}
  for (const b of blocks) {
    const body = src.slice(b.start, b.end)
    const at = body.findIndex((l) => /^\s*b\.ToTable\("/.test(l))
    if (at < 0) continue
    const [, table, schema] = /b\.ToTable\("(\w+)"(?:, "(\w+)")?/.exec(body[at])
    const columns = []
    const byName = {}
    body.forEach((l, i) => {
      const p = /^\s*b\.Property<([\w?[\]]+)>\("(\w+)"\)/.exec(l)
      if (!p) return
      const st = statement(b.start + i)
      const type = /HasColumnType\("([^"]+)"\)/.exec(st)?.[1] ?? p[1]
      // A value type is nullable when its CLR type is (int?); a reference type unless IsRequired.
      const valueType = /^(int|long|short|byte|bool|decimal|double|float|DateTime|DateOnly|TimeOnly|DateTimeOffset|Guid|TimeSpan)$/.test(p[1].replace('?', ''))
      const nullable = valueType ? p[1].endsWith('?') : !/IsRequired\(\)/.test(st)
      const notes = []
      const def = /HasDefaultValue(?:Sql)?\(([^)]*)\)/.exec(st)?.[1]
      if (def) notes.push(`default ${def.replace(/^"|"$/g, '')}`)
      if (/IsConcurrencyToken\(\)/.test(st)) notes.push('concurrency')
      if (sqlite) {
        const clr = p[1].replace('?', '')
        if (!['string', 'int', 'long'].includes(clr)) notes.push(clr)
        const max = /HasMaxLength\((\d+)\)/.exec(st)?.[1]
        if (max) notes.push(`max ${max}`)
        const collation = /UseCollation\("(\w+)"\)/.exec(st)?.[1]
        if (collation) notes.push(`collate ${collation}`)
        if (/ValueGeneratedOnAdd\(\)/.test(st) && (clr === 'int' || clr === 'long')) notes.push('autoincrement')
      }
      const c = { name: p[2], type: type.toUpperCase(), nullable, notes }
      columns.push(c)
      byName[p[2]] = c
    })
    body.forEach((l, i) => {
      const id = /UseIdentityColumn\(b\.Property<\w+>\("(\w+)"\)\)/.exec(l)
      if (id) byName[id[1]]?.notes.unshift('identity')
      const key = /^\s*b\.HasKey\(([^)]*)\)/.exec(l)
      if (key)
        for (const k of key[1].matchAll(/"(\w+)"/g)) {
          byName[k[1]]?.notes.unshift('PK')
          // A key column is never null, whether or not its CLR type says so (a string key).
          if (byName[k[1]]) byName[k[1]].nullable = false
        }
      const ix = /^\s*b\.HasIndex\("(\w+)"\)/.exec(l)
      if (ix && /IsUnique\(\)/.test(statement(b.start + i))) {
        const filter = /HasFilter\("([^"]*)"\)/.exec(statement(b.start + i))?.[1]
        byName[ix[1]]?.notes.push(filter ? `unique where ${filter}` : 'unique')
      }
    })
    const checks = [...body.join('\n').matchAll(/HasCheckConstraint\("\w+", "([^"]*)"\)/g)].map((x) => x[1])
    tables[b.entity] = {
      database,
      ...(sqlite ? { provider } : { schema }),
      table,
      file: rel,
      line: b.start + at + 1,
      columns,
      denies: [],
      ...(checks.length ? { checks } : {}),
    }
  }

  // Foreign keys: b.HasOne("Target", ...)...HasForeignKey("Column") in the relationship blocks.
  for (const b of blocks) {
    const t = tables[b.entity]
    if (!t) continue
    src.slice(b.start, b.end).forEach((l, i) => {
      const one = /^\s*b\.HasOne\("([\w.]+)"/.exec(l)
      if (!one) return
      const fk = /HasForeignKey\("(\w+)"\)/.exec(statement(b.start + i))?.[1]
      const target = tables[one[1]]
      const col = t.columns.find((c) => c.name === fk)
      if (col && target) col.notes.push(`→ ${target.schema ? target.schema + '.' : ''}${target.table}`)
    })
  }
  return Object.values(tables)
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
      ...(s.aspnetEndpoints ?? []).flatMap((d) => aspnetEndpoints(repo, d)),
    ],
    tables: [...(s.sql ?? []).flatMap((d) => sqlTables(repo, d)), ...(s.efSnapshots ?? []).flatMap((x) => efTables(repo, x))],
    routes: [
      ...(s.angularRoutes ? angularRoutes(repo, s.angularRoutes) : []),
      ...(s.reactRoutes ? reactRoutes(repo, s.reactRoutes) : []),
    ],
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
