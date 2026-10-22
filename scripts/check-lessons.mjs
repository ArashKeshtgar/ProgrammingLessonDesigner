// Validates every lesson:
// - required fields, unique ids, every compare row and code group covering the lesson's languages;
// - every code sample that points at examples/ names a file that exists and a region inside it;
// - each ref points at a real file/line when the projects folder is available
//   (LESSON_REFS_ROOT, default D:/E/Projects; skipped silently in CI).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'src', 'data', 'lessons')
const refsRoot = process.env.LESSON_REFS_ROOT || 'D:/E/Projects'
const BACKEND = ['csharp', 'typescript', 'python', 'java']
const problems = []
const ids = new Set()

for (const f of readdirSync(dir).filter((x) => /^[a-z]\d+.*\.json$/.test(x))) {
  const l = JSON.parse(readFileSync(path.join(dir, f), 'utf-8'))
  const at = (m) => problems.push(`${f}: ${m}`)
  for (const k of ['_id', 'n', 'tag', 'en', 'fa', 'goal', 'story', 'concepts', 'compare', 'code', 'pitfalls', 'refs', 'exercises', 'take'])
    if (l[k] == null || (Array.isArray(l[k]) && !l[k].length)) at(`missing ${k}`)
  if (ids.has(l._id)) at(`duplicate id ${l._id}`)
  ids.add(l._id)
  const langs = l.langs ?? BACKEND

  const groups = {}
  for (const s of l.code ?? []) {
    ;(groups[s.group] ??= []).push(s.lang)
    if (s.lang !== 'all' && !langs.includes(s.lang)) at(`code group "${s.group}" has a ${s.lang} tab the lesson does not list`)
    if (!s.code && !s.file) at(`code "${s.group}/${s.lang}" has neither code nor file`)
    if (s.file) {
      const file = path.join(root, 'examples', s.file)
      if (!existsSync(file)) at(`example not found: examples/${s.file}`)
      else if (s.region && !new RegExp(`#region\\s+${s.region}\\b`).test(readFileSync(file, 'utf-8')))
        at(`region "${s.region}" not found in examples/${s.file}`)
    }
  }
  for (const [g, have] of Object.entries(groups))
    if (!have.includes('all'))
      for (const lang of langs) if (!have.includes(lang)) at(`code group "${g}" has no ${lang}`)
  for (const r of l.compare ?? []) for (const lang of langs) if (!r[lang]) at(`compare "${r.concept}" has no ${lang}`)

  if (existsSync(refsRoot))
    for (const r of l.refs ?? []) {
      const file = path.join(refsRoot, r.project, r.file)
      if (!existsSync(file)) {
        at(`ref not found: ${r.project}/${r.file}`)
        continue
      }
      const lines = readFileSync(file, 'utf-8').split('\n').length
      if (r.line && r.line > lines) at(`ref ${r.project}/${r.file}:${r.line} is past the end (${lines} lines)`)
    }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`lessons ok (${ids.size})`)
