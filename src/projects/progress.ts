import { reactive } from 'vue'

// Which topics this visitor has finished ("<project>/<topic>"), kept in the browser
// only. A topic is finished by answering its quiz or with the button under it.
const KEY = 'projects-read'

function load(): Set<string> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return new Set(Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set() // storage blocked (private mode) or a broken value: start empty
  }
}

const read = reactive(load())

export const isRead = (id: string) => read.has(id)

export function setRead(id: string, on: boolean): void {
  if (on) read.add(id)
  else read.delete(id)
  try {
    localStorage.setItem(KEY, JSON.stringify([...read]))
  } catch {
    // not saved; it still counts for this visit
  }
}

// How many of a project's topics are finished.
export const readCount = (project: string, topics: { id: string }[]) =>
  topics.filter((t) => read.has(`${project}/${t.id}`)).length
