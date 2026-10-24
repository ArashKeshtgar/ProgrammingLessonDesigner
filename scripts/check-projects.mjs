// Validates the Projects tab (src/data/projects/*.json against the generated map):
// - every project of the map has a page file with a summary in both languages, and a
//   colour in the Sass tokens ($project-accents);
// - a page written in one language is written in the other, section by section;
// - every example a section names exists, has a title in both languages, and its
//   file and region exist when it quotes this repo's Sass;
// - each ref points at a real file/line when the projects folder is available
//   (LESSON_REFS_ROOT, default D:/E/Projects; skipped silently in CI).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'src', 'data', 'projects')
const refsRoot = process.env.LESSON_REFS_ROOT || 'D:/E/Projects'
const LANGS = ['fa', 'en']
const problems = []

const map = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'project-map.json'), 'utf-8'))
const tokens = readFileSync(path.join(root, 'src', 'styles', 'abstracts', '_tokens.scss'), 'utf-8')
const accents = new Set(
  [...(/\$project-accents: \(([\s\S]*?)\n\);/.exec(tokens)?.[1] ?? '').matchAll(/^\s+([a-z0-9-]+):/gm)].map((m) => m[1]),
)

const docs = {}
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(path.join(dir, f), 'utf-8'))
  const at = (m) => problems.push(`${f}: ${m}`)
  if (d.id !== f.replace(/\.json$/, '')) at(`id "${d.id}" does not match the file name`)
  docs[d.id] = d

  if (d.summary) for (const l of LANGS) if (!d.summary[l]) at(`summary has no ${l}`)
  const written = LANGS.filter((l) => d[l])
  if (written.length === 1) at(`written only in ${written[0]}`)
  if (written.length === 2) {
    const ids = (l) => d[l].map((s) => s.id).join(',')
    if (ids('fa') !== ids('en')) at(`sections differ: fa [${ids('fa')}] / en [${ids('en')}]`)
    for (const l of LANGS)
      d[l].forEach((s, i) => {
        const other = d[l === 'fa' ? 'en' : 'fa'][i]
        if (!s.h) at(`${l} section ${s.id} has no heading`)
        if (JSON.stringify(s.examples ?? []) !== JSON.stringify(other?.examples ?? []))
          at(`section ${s.id}: fa and en show different examples`)
        for (const ex of s.examples ?? []) if (!d.examples?.[ex]) at(`section ${s.id} names a missing example "${ex}"`)
      })
  }
  for (const [id, ex] of Object.entries(d.examples ?? {})) {
    for (const l of LANGS) if (!ex.title?.[l]) at(`example ${id} has no ${l} title`)
    if (!ex.code && !ex.file) at(`example ${id} has neither code nor file`)
    if (ex.file) {
      const file = path.join(root, 'src', ex.file)
      if (!existsSync(file)) at(`example ${id}: src/${ex.file} not found`)
      else if (ex.region && !new RegExp(`#region\\s+${ex.region}\\b`).test(readFileSync(file, 'utf-8')))
        at(`example ${id}: region "${ex.region}" not found in src/${ex.file}`)
    }
  }
  if (existsSync(refsRoot))
    for (const r of d.refs ?? []) {
      for (const l of LANGS) if (!r.note?.[l]) at(`ref ${r.file} has no ${l} note`)
      const file = path.join(refsRoot, r.project, r.file)
      if (!existsSync(file)) {
        at(`ref not found: ${r.project}/${r.file}`)
        continue
      }
      const lines = readFileSync(file, 'utf-8').split('\n').length
      if (r.line && r.line > lines) at(`ref ${r.project}/${r.file}:${r.line} is past the end (${lines} lines)`)
    }
}

for (const p of map.projects) {
  if (!docs[p.id]?.summary) problems.push(`project ${p.id}: no src/data/projects/${p.id}.json with a summary`)
  if (!accents.has(p.id)) problems.push(`project ${p.id}: no colour in $project-accents (src/styles/abstracts/_tokens.scss)`)
}
for (const id of accents)
  if (!map.projects.some((p) => p.id === id)) problems.push(`$project-accents has "${id}", which is not in the map`)
for (const id of ['overview', 'styling']) if (!docs[id]) problems.push(`missing src/data/projects/${id}.json`)

// --- topics (src/data/topics/<project>.json) and their code snapshots -------------
const topicsDir = path.join(root, 'src', 'data', 'topics')
const KINDS = ['endpoints', 'tables', 'routes']
for (const f of readdirSync(topicsDir).filter((x) => x.endsWith('.json') && !x.endsWith('.code.json'))) {
  const t = JSON.parse(readFileSync(path.join(topicsDir, f), 'utf-8'))
  const at = (m) => problems.push(`topics/${f}: ${m}`)
  if (!map.projects.some((p) => p.id === t.project)) at(`project "${t.project}" is not in the map`)
  const snapFile = path.join(topicsDir, f.replace(/\.json$/, '.code.json'))
  const snap = existsSync(snapFile) ? JSON.parse(readFileSync(snapFile, 'utf-8')) : null
  if (!snap) at('no code snapshot; run npm run code')

  const groups = new Set(t.groups.map((g) => g.id))
  for (const g of t.groups) for (const l of LANGS) if (!g.title?.[l]) at(`group ${g.id} has no ${l} title`)
  const ids = new Set()
  for (const page of t.pages) {
    const where = `topic ${page.id}`
    if (ids.has(page.id)) at(`${where}: duplicate id`)
    ids.add(page.id)
    if (!groups.has(page.group)) at(`${where}: unknown group "${page.group}"`)
    for (const l of LANGS) if (!page.title?.[l]) at(`${where}: no ${l} title`)
    for (const l of LANGS) if (!page[l]?.length) at(`${where}: no ${l} sections`)
    const fa = page.fa ?? []
    const en = page.en ?? []
    if (fa.map((s) => s.id).join() !== en.map((s) => s.id).join()) at(`${where}: fa and en sections differ`)
    const used = new Set()
    en.forEach((s, i) => {
      const other = fa[i]
      if (JSON.stringify(s.examples ?? []) !== JSON.stringify(other?.examples ?? [])) at(`${where}/${s.id}: fa and en show different examples`)
      if (JSON.stringify(s.data ?? null) !== JSON.stringify(other?.data ?? null)) at(`${where}/${s.id}: fa and en show different data`)
      for (const ex of s.examples ?? []) {
        used.add(ex)
        if (!page.examples?.[ex]) at(`${where}/${s.id}: names a missing example "${ex}"`)
      }
      if (s.data) {
        if (!KINDS.includes(s.data.kind)) at(`${where}/${s.id}: unknown data kind "${s.data.kind}"`)
        const known = s.data.kind === 'endpoints' ? snap?.endpoints.map((e) => e.area) : s.data.kind === 'tables' ? snap?.tables.map((x) => x.table) : null
        for (const name of s.data.only ?? []) if (known && !known.includes(name)) at(`${where}/${s.id}: "${name}" is not in the code snapshot`)
      }
    })
    for (const [id, ex] of Object.entries(page.examples ?? {})) {
      if (!used.has(id)) at(`${where}: example "${id}" is never shown`)
      for (const l of LANGS) if (!ex.title?.[l]) at(`${where}: example ${id} has no ${l} title`)
      if (!ex.file || !ex.from || !ex.lang) at(`${where}: example ${id} needs file, from and lang`)
      if (snap && !snap.examples[`${page.id}/${id}`]) at(`${where}: example ${id} is not in the snapshot; run npm run code`)
    }
    for (const file of page.files ?? []) if (snap && snap.files[file] === undefined) at(`${where}: ${file} is not in the snapshot; run npm run code`)
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`projects ok (${map.projects.length} projects, ${Object.keys(docs).length} pages)`)
