import type { CodeSample } from '../types/lesson'

// Every example file, as text, bundled at build time. Lessons point at these by path,
// so the page shows exactly the code the CI compiles and tests.
const files = import.meta.glob<string>(
  [
    '../../examples/**/*.{py,ts,tsx,cs,java,vue,razor,yml,yaml,properties}',
    '../../examples/**/Dockerfile',
    '!../../examples/**/node_modules/**',
    '!../../examples/**/.venv/**',
    '!../../examples/**/bin/**',
    '!../../examples/**/obj/**',
    '!../../examples/**/target/**',
    '!../../examples/**/dist/**',
  ],
  { query: '?raw', import: 'default', eager: true },
)

const PREFIX = '../../examples/'

export function exampleFile(path: string): string | undefined {
  return files[PREFIX + path]
}

const START = /#region\s+(\S+)/
const END = /#endregion/

// The lines between "#region <name>" and its "#endregion" (any comment syntax),
// without nested region markers, dedented.
export function extractRegion(text: string, name: string): string | undefined {
  const lines = text.split(/\r?\n/)
  const at = lines.findIndex((l) => START.exec(l)?.[1] === name)
  if (at < 0) return undefined
  const out: string[] = []
  let depth = 0
  for (const line of lines.slice(at + 1)) {
    if (START.test(line)) {
      depth++
      continue
    }
    if (END.test(line)) {
      if (depth === 0) break
      depth--
      continue
    }
    out.push(line)
  }
  return dedent(out)
}

function dedent(lines: string[]): string {
  while (lines.length && !lines[0].trim()) lines.shift()
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(indent)).join('\n')
}

export function sampleCode(s: CodeSample): string {
  if (s.code) return s.code
  const text = s.file ? exampleFile(s.file) : undefined
  if (text === undefined) return `// missing example file: ${s.file}`
  if (!s.region) return text.trimEnd()
  return extractRegion(text, s.region) ?? `// missing region "${s.region}" in ${s.file}`
}

const BY_EXTENSION: Record<string, string> = {
  py: 'python',
  ts: 'typescript',
  tsx: 'typescript',
  cs: 'csharp',
  java: 'java',
  vue: 'xml',
  razor: 'xml',
  yml: 'yaml',
  yaml: 'yaml',
  properties: 'ini',
}

const BY_LANG: Record<string, string> = {
  csharp: 'csharp',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  blazor: 'csharp',
  angular: 'typescript',
  react: 'typescript',
  vue: 'xml',
}

// highlight.js language for a sample: from the file name when there is one, else from the tab.
export function highlightLanguage(s: CodeSample): string {
  if (s.file?.endsWith('Dockerfile')) return 'dockerfile'
  const ext = s.file?.split('.').pop()
  return (ext && BY_EXTENSION[ext]) || BY_LANG[s.lang] || 'plaintext'
}
