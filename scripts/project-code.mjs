// Snapshots what the topic pages of a project show from its real repo, so the site
// builds (and CI checks) without that repo: the code excerpts the pages quote, the
// length of every file they list, and tables read from the code itself: HTTP
// endpoints (NestJS controllers, Express apps and routers, ASP.NET Core Minimal APIs), tables
// (SQL scripts, EF Core model snapshots, Mongoose schemas), Angular and React routes.
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

// Express apps in plain JavaScript: app.get("/api/...", ...) in every .js file of `dir` (tests
// left out). `gate` is the line that closes /api to anyone not signed in, app.use("/api", (req,
// res, next) =>: routes declared before it in its file are public, every other route (later in
// that file, or in a file whose routes are registered after it) needs a session. The area is the
// path's first segment after /api. A path declared twice (a second /api/session for when there
// is no password) is listed once, as first declared.
function expressRoutes(repo, { dir, gate }) {
  const files = walk(path.join(repo, dir), (n) => /\.(js|mjs|ts)$/.test(n) && !/\.test\./.test(n))
  const gateRe = gate ? new RegExp(gate) : null
  const out = []
  const seen = new Set()
  for (const file of files) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const src = lines(readFileSync(file, 'utf-8'))
    const gateAt = gateRe ? src.findIndex((l) => gateRe.test(l)) : -1
    src.forEach((l, i) => {
      const m = /\b(?:app|router)\.(get|post|put|patch|delete)\(\s*["'`](\/api\/[^"'`]*)["'`]/.exec(l)
      if (!m || seen.has(m[1] + m[2])) return
      seen.add(m[1] + m[2])
      const access = !gateRe ? 'public' : gateAt >= 0 && i < gateAt ? 'public' : 'signed-in'
      out.push({ area: m[2].split('/')[2], method: m[1].toUpperCase(), path: m[2], access, file: rel, line: i + 1 })
    })
  }
  return out
}

// Express routers mounted by the app: `import xRoutes from './routes/x'`, then
// app.use('/api/x', xRoutes) in `app`; each router's router.get('/sub', auth, ...) is /api/x/sub.
// Access comes from the middleware names in `access` ({ auth: 'signed-in', admin: 'Admin' }),
// passed on the route or by a router.use(...) above it; a later name in the map wins. Routes
// declared on the app itself (app.get('/api/health')) are listed too. A route whose path is on
// the next line (router.post(\n '/login', ...) is found there.
function expressRouters(repo, { app, access }) {
  const names = Object.keys(access)
  const levelOf = (text) => {
    const hit = names.filter((n) => new RegExp(`[(,]\\s*${n}\\b(?!\\()`).test(text))
    return hit.length ? access[hit.at(-1)] : null
  }
  const appSrc = lines(readFileSync(path.join(repo, app), 'utf-8'))
  const imports = {}
  for (const l of appSrc) {
    const m = /^import (\w+) from '\.\/([\w/]+)'/.exec(l)
    if (m) imports[m[1]] = m[2] + '.ts'
  }
  const out = []
  const scan = (file, prefix, re) => {
    const src = lines(readFileSync(path.join(repo, file), 'utf-8'))
    let base = null
    src.forEach((l, i) => {
      if (/^router\.use\(/.test(l)) base = levelOf(l) ?? base
      const m = re.exec(l)
      if (!m) return
      // The route's head: its line, and the next when the path is there.
      const head = m[2] === undefined ? l + ' ' + (src[i + 1] ?? '') : l
      const sub = m[2] ?? /^\s*'([^']*)'/.exec(src[i + 1] ?? '')?.[1]
      if (sub === undefined) return
      const full = (prefix + (sub === '/' ? '' : sub)) || '/'
      out.push({
        area: full.split('/')[2],
        method: m[1].toUpperCase(),
        path: full,
        access: levelOf(head) ?? base ?? 'public',
        file,
        line: i + 1,
      })
    })
  }
  scan(app, '', /^app\.(get|post|put|patch|delete)\('(\/api\/[^']*)'/)
  for (const l of appSrc) {
    const m = /^app\.use\('(\/api\/[^']*)', (\w+)\)/.exec(l)
    if (m && imports[m[2]]) scan(imports[m[2]], m[1], /^router\.(get|post|put|patch|delete)\((?:'([^']*)')?/)
  }
  return out
}

// SQL Server: CREATE TABLE blocks (columns, keys, defaults, checks, references), columns and
// CHECKs added later by ALTER TABLE … ADD, unique indexes and DENY grants. Tables in a schema
// other than dbo carry it; the database is the script's USE, or the scan entry's own
// ({ dir, database }) for scripts run against a database they don't name.
function sqlTables(repo, entry) {
  const { dir, database } = typeof entry === 'string' ? { dir: entry } : entry
  const out = []
  const find = (schema, table) => out.find((t) => t.table === table && (t.schema ?? 'dbo') === schema)
  // A CHECK written over several lines reads as one, without the joins' extra spaces.
  const squash = (s) => s.replace(/\s+/g, ' ').trim()
  // Parentheses opened on a line and closed on a later one (a CHECK's list): one logical line.
  const depth =(s) => [...s.replace(/'[^']*'|--.*$/g, '')].reduce((d, ch) => d + (ch === '(') - (ch === ')'), 0)
  // The logical line starting at src[j]: joined while a parenthesis is open, or while the next
  // line goes on with the same column's constraints (no comma yet). Returns it and its last index.
  const logical = (src, j) => {
    let line = src[j]
    const more = () => j + 1 < src.length
    const join = () => (line = line.replace(/\s*--.*$/, '') + ' ' + src[++j].trim())
    for (;;) {
      if (depth(line) > 0 && more()) join()
      else if (!/,\s*(--.*)?$/.test(line) && more() && /^\s*(CONSTRAINT|REFERENCES|DEFAULT|CHECK)\b/.test(src[j + 1])) join()
      else return { line, end: j }
    }
  }
  const column = (line) => {
    const c = /^\s*\[?(\w+)\]?\s+([A-Za-z0-9]+(?:\(\s*(?:\d+|max|MAX)(?:,\s*\d+)?\))?)(?=[\s,;]|$)(.*?)[,;]?\s*$/.exec(line)
    if (!c || /^(CONSTRAINT|PERIOD|PRIMARY|UNIQUE|CHECK|FOREIGN|INDEX|ALTER|IF|GO)$/i.test(c[1])) return null
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
    if (ck) notes.push(`check ${squash(ck)}`)
    // A key column is never null, whether or not it says NOT NULL.
    return { name: c[1], type: c[2].toUpperCase(), nullable: !/NOT NULL|PRIMARY KEY/.test(rest), notes }
  }
  for (const file of walk(path.join(repo, dir), (n) => n.endsWith('.sql')).sort()) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const src = lines(readFileSync(file, 'utf-8'))
    let db = database ?? null
    src.forEach((l, i) => {
      const use = /^USE (\w+);/.exec(l)
      if (use) db = use[1]
      // ALTER TABLE x ADD, then column definitions on the next lines, up to the one ending in ;
      const addColumns = /ALTER TABLE (\w+)\.(\w+) ADD\s*$/.exec(l)
      if (addColumns) {
        for (let j = i + 1; j < src.length; j++) {
          const { line, end } = logical(src, j)
          const c = column(line)
          if (c) find(addColumns[1], addColumns[2])?.columns.push(c)
          j = end
          if (/;\s*(--.*)?$/.test(line)) break
        }
      }
      const addCheck = /ALTER TABLE (\w+)\.(\w+) ADD CONSTRAINT \w+ CHECK \(/.exec(l)
      if (addCheck) {
        const { line } = logical(src, i)
        const t = find(addCheck[1], addCheck[2])
        const body = /CHECK \((.+)\)\s*;?\s*$/.exec(line)?.[1]
        if (t && body) t.checks = [...(t.checks ?? []), squash(body)]
      }
      const create = /CREATE TABLE (\w+)\.(\w+) \(/.exec(l)
      if (create) {
        const columns = []
        const checks = []
        for (let j = i + 1; j < src.length && !/^\s*\)/.test(src[j]); j++) {
          const { line, end } = logical(src, j)
          j = end
          // A table-level constraint: CHECKs are kept as they are, a key on several columns
          // shows as PK on each of them.
          const tc = /^\s*CONSTRAINT \w+ CHECK \((.+)\),?\s*$/.exec(line)
          if (tc) checks.push(squash(tc[1]))
          const pk = /^\s*CONSTRAINT \w+ PRIMARY KEY (?:CLUSTERED |NONCLUSTERED )?\(([^)]+)\)/.exec(line)
          if (pk) for (const name of pk[1].split(',').map((s) => s.trim().replace(/\s+(ASC|DESC)$/i, ''))) {
            const col = columns.find((x) => x.name === name)
            if (col && !col.notes.includes('PK')) col.notes.unshift('PK')
            if (col) col.nullable = false
          }
          const c = column(line)
          if (c) columns.push(c)
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

// Mongoose: each mongoose.model('Name', NameSchema) in `dir` is a collection (named the way
// Mongoose names it: lower case, plural). Its fields come from the schema's object literal:
// a nested object or a subdocument (new Schema({...}) or a schema of the same file) shows as
// its own fields, `parent.child`, an array of subdocuments as `parent[].child`. `required` is
// "not null"; unique, sparse, ref, enum, default, min/max and maxlength are notes, and
// Schema.index({...}) the collection's indexes. `{ timestamps: true }` adds createdAt and
// updatedAt.
function mongooseCollections(repo, { dir, database }) {
  const out = []
  // Splits a literal's body on its top-level commas (not inside brackets or strings).
  const split = (s) => {
    const parts = []
    let depth = 0
    let quote = null
    let cur = ''
    for (const ch of s) {
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === "'" || ch === '"' || ch === '`') quote = ch
      else if ('([{'.includes(ch)) depth++
      else if (')]}'.includes(ch)) depth--
      else if (ch === ',' && depth === 0) {
        parts.push(cur)
        cur = ''
        continue
      }
      cur += ch
    }
    if (cur.trim()) parts.push(cur)
    return parts.map((p) => p.trim()).filter(Boolean)
  }
  // The text from an opening bracket at `at` to its match, both included.
  const balanced = (s, at) => {
    let depth = 0
    for (let i = at; i < s.length; i++) {
      if ('([{'.includes(s[i])) depth++
      else if (')]}'.includes(s[i]) && --depth === 0) return s.slice(at, i + 1)
    }
    return s.slice(at)
  }
  const entries = (obj) =>
    split(obj.trim().slice(1, -1)).map((e) => {
      const m = /^['"]?([\w.$]+)['"]?\s*:\s*([\s\S]*)$/.exec(e)
      return m ? [m[1], m[2].trim()] : [e, '']
    })
  const plural = (name) => {
    const n = name.toLowerCase()
    return /[^aeiou]y$/.test(n) ? n.slice(0, -1) + 'ies' : /(s|x|ch|sh)$/.test(n) ? n + 'es' : n + 's'
  }

  for (const file of walk(path.join(repo, dir), (n) => n.endsWith('.ts')).sort()) {
    const rel = path.relative(repo, file).replace(/\\/g, '/')
    const text = readFileSync(file, 'utf-8').replace(/\r\n/g, '\n')
    // No comments inside a literal: a comment's commas and quotes would split it wrongly.
    const code = text.replace(/\/\/.*$/gm, '')
    const schemas = {}
    for (const m of code.matchAll(/const (\w+) = new Schema(?:<[^>]*>)?\(/g)) {
      const args = split(balanced(code, m.index + m[0].length - 1).slice(1, -1))
      schemas[m[1]] = { body: args[0], options: args[1] ?? '' }
    }
    const subSchema = (value) => {
      const inline = /^new Schema(?:<[^>]*>)?\(/.exec(value)
      if (inline) return { body: split(balanced(value, inline[0].length - 1).slice(1, -1))[0] }
      return schemas[value]
    }

    const fields = (body, prefix, columns) => {
      for (const [key, value] of entries(body)) {
        const name = prefix + key
        const props = value.startsWith('{') ? Object.fromEntries(entries(value)) : { type: value }
        if (!('type' in props)) {
          fields(value, name + '.', columns)
          continue
        }
        const t = props.type
        const array = /^\[(\w+)\]$/.exec(t)
        const sub = array ? schemas[array[1]] : subSchema(t)
        const type = array
          ? sub
            ? `[${array[1].replace(/Schema$/, '')}]`
            : `[${array[1]}]`
          : sub
            ? 'Object'
            : t.replace(/^Schema\.Types\./, '')
        const notes = []
        if (props.unique === 'true') notes.push(props.sparse === 'true' ? 'unique sparse' : 'unique')
        const ref = /^'(\w+)'$/.exec(props.ref ?? '')?.[1]
        if (ref) notes.push(`→ ${plural(ref)}`)
        if (props.enum) {
          const list = [...props.enum.matchAll(/'([^']*)'/g)].map((x) => x[1])
          notes.push(`enum ${list.length ? list.join('|') : props.enum}`)
        }
        if (props.default && props.default !== 'undefined' && props.default !== '[]') notes.push(`default ${props.default.replace(/^'|'$/g, '')}`)
        if (props.min) notes.push(`min ${props.min}`)
        if (props.max) notes.push(`max ${props.max}`)
        if (props.maxlength) notes.push(`maxlength ${props.maxlength}`)
        columns.push({ name, type, nullable: props.required !== 'true', notes })
        if (sub) fields(sub.body, name + (array ? '[].' : '.'), columns)
      }
    }

    for (const m of code.matchAll(/mongoose\.model(?:<[^>]*>)?\('(\w+)', (\w+)\)/g)) {
      const schema = schemas[m[2]]
      if (!schema) continue
      const columns = [{ name: '_id', type: 'ObjectId', nullable: false, notes: ['PK'] }]
      fields(schema.body, '', columns)
      if (/timestamps:\s*true/.test(schema.options))
        for (const name of ['createdAt', 'updatedAt']) columns.push({ name, type: 'Date', nullable: false, notes: ['timestamps'] })
      const indexes = [...code.matchAll(new RegExp(`${m[2]}\\.index\\((\\{[^)]*\\})\\)`, 'g'))].map((x) => x[1].replace(/\s+/g, ' '))
      const at = text.split('\n').findIndex((l) => l.includes(`const ${m[2]} = new Schema`))
      out.push({
        database,
        provider: 'mongodb',
        table: plural(m[1]),
        file: rel,
        line: at + 1,
        columns,
        denies: [],
        ...(indexes.length ? { indexes } : {}),
      })
    }
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
// permission as its guard. A <Route written over several lines reads as one, and a page wrapped
// in a guard component, element={<PrivateRoute><Orders /></PrivateRoute>}, has it as its guard.
function reactRoutes(repo, file) {
  const src = lines(readFileSync(path.join(repo, file), 'utf-8'))
  const joined = []
  for (let i = 0; i < src.length; i++) {
    if (!/^\s*<Route\s*$/.test(src[i])) {
      joined.push(src[i])
      continue
    }
    let l = src[i].trimEnd()
    while (i + 1 < src.length && !/^\s*\/>/.test(src[i])) l += ' ' + src[++i].trim()
    joined.push(l.replace(/\{ </g, '{<').replace(/> </g, '><'))
  }
  return joined.flatMap((l) => {
    const wrapped = /<Route path="([^"]*)" element=\{<(\w+)><(\w+)/.exec(l)
    if (wrapped) return [{ path: wrapped[1], component: wrapped[3], guards: [wrapped[2]] }]
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
  // `path`: where the repo is, when it isn't D:/E/Projects/<repo> (the page still shows `repo`).
  const repo = path.join(projectsRoot, topics.path ?? topics.repo)
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
      ...(s.expressRoutes ?? []).flatMap((x) => expressRoutes(repo, x)),
      ...(s.aspnetEndpoints ?? []).flatMap((d) => aspnetEndpoints(repo, d)),
      ...(s.expressRouters ?? []).flatMap((x) => expressRouters(repo, x)),
    ],
    tables: [
      ...(s.sql ?? []).flatMap((d) => sqlTables(repo, d)),
      ...(s.efSnapshots ?? []).flatMap((x) => efTables(repo, x)),
      ...(s.mongoose ?? []).flatMap((x) => mongooseCollections(repo, x)),
    ],
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
