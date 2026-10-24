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

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`projects ok (${map.projects.length} projects, ${Object.keys(docs).length} pages)`)
