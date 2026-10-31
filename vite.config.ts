import vue from '@vitejs/plugin-vue'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

// The Projects tab needs every topic's id, group, title and headings up front (the
// contents list, previous / next, search), but the topic's text and code only when it
// is opened. This module is that index, read from src/data/topics/*.json at build
// time; the topics themselves are loaded per project (src/projects/model.ts).
function topicIndex(): Plugin {
  const id = 'virtual:topic-index'
  const resolved = `\0${id}`
  const dir = fileURLToPath(new URL('./src/data/topics', import.meta.url))
  const isTopics = (f: string) => f.endsWith('.json') && !f.endsWith('.code.json')
  return {
    name: 'topic-index',
    resolveId: (x) => (x === id ? resolved : undefined),
    load(x) {
      if (x !== resolved) return
      const index = readdirSync(dir)
        .filter(isTopics)
        .map((f) => {
          this.addWatchFile(path.join(dir, f))
          const t = JSON.parse(readFileSync(path.join(dir, f), 'utf-8'))
          return {
            project: t.project,
            groups: t.groups,
            pages: t.pages.map((p: { id: string; group: string; title: unknown; fa: { h: string }[]; en: { h: string }[] }) => ({
              id: p.id,
              group: p.group,
              title: p.title,
              heads: { fa: p.fa.map((s) => s.h), en: p.en.map((s) => s.h) },
            })),
          }
        })
      return `export default ${JSON.stringify(index)}`
    },
    // A topic file added, edited or removed changes the index.
    handleHotUpdate({ file, server }) {
      if (path.dirname(path.resolve(file)) !== dir || !isTopics(file)) return
      const mod = server.moduleGraph.getModuleById(resolved)
      if (mod) server.moduleGraph.invalidateModule(mod)
    },
  }
}

// For a GitHub Pages build pass --base=/ProgrammingLessonDesigner/ on the CLI.
export default defineConfig({
  plugins: [vue(), topicIndex()],
  // Sass's modern API; the legacy one is deprecated and prints a warning per file.
  css: { preprocessorOptions: { scss: { api: 'modern' } } },
})
