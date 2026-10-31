import type { DocLang } from './i18n'
import { PAGES, type Page } from './model'

// Search over the Projects tab in one language: project names, topic titles and the
// headings inside topics. Small enough to scan on every keystroke.
export interface Hit {
  page: Page
  // the heading that matched, when the title did not
  head?: string
}

// Persian is typed with Arabic ي and ك on some keyboards, and with or without the
// zero-width non-joiner; neither should change what is found.
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‏‎]/g, '')
    .replace(/\s+/g, ' ')

export function search(query: string, lang: DocLang, limit = 30): Hit[] {
  const words = norm(query).trim().split(' ').filter(Boolean)
  if (!words.length) return []
  const has = (text: string) => {
    const t = norm(text)
    return words.every((w) => t.includes(w))
  }
  const byTitle: Hit[] = []
  const byHead: Hit[] = []
  for (const page of PAGES) {
    if (!page.project) continue
    const title = page.topic ? page.topic.title[lang] : page.project.name
    // A topic is also found by its project's name: "labflow login".
    if (has(page.topic ? `${title} ${page.project.name}` : title)) byTitle.push({ page })
    else {
      const head = page.topic?.heads[lang].find(has)
      if (head) byHead.push({ page, head })
    }
  }
  return [...byTitle, ...byHead].slice(0, limit)
}
