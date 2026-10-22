// Validates every lesson: required fields, all four languages in each code group,
// and that each ref points at a real file/line when the projects folder is available
// (set LESSON_REFS_ROOT, default D:/E/Projects; skipped silently in CI).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'lessons')
const root = process.env.LESSON_REFS_ROOT || 'D:/E/Projects'
const LANGS = ['csharp', 'typescript', 'python', 'java']
const problems = []
const ids = new Set()

for (const f of readdirSync(dir).filter((x) => /^l.*\.json$/.test(x))) {
  const l = JSON.parse(readFileSync(path.join(dir, f), 'utf-8'))
  const at = (m) => problems.push(`${f}: ${m}`)
  for (const k of ['_id', 'n', 'tag', 'en', 'fa', 'goal', 'story', 'concepts', 'compare', 'code', 'pitfalls', 'refs', 'exercises', 'take'])
    if (l[k] == null || (Array.isArray(l[k]) && !l[k].length)) at(`missing ${k}`)
  if (ids.has(l._id)) at(`duplicate id ${l._id}`)
  ids.add(l._id)

  const groups = {}
  for (const s of l.code ?? []) (groups[s.group] ??= []).push(s.lang)
  for (const [g, langs] of Object.entries(groups))
    for (const lang of LANGS) if (!langs.includes(lang)) at(`code group "${g}" has no ${lang}`)
  for (const r of l.compare ?? []) for (const lang of LANGS) if (!r[lang]) at(`compare "${r.concept}" has no ${lang}`)

  if (existsSync(root))
    for (const r of l.refs ?? []) {
      const file = path.join(root, r.project, r.file)
      if (!existsSync(file)) { at(`ref not found: ${r.project}/${r.file}`); continue }
      const lines = readFileSync(file, 'utf-8').split('\n').length
      if (r.line && r.line > lines) at(`ref ${r.project}/${r.file}:${r.line} is past the end (${lines} lines)`)
    }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`lessons ok (${ids.size})`)
