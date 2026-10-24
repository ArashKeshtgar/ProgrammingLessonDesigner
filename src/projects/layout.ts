// Lays a small directed graph out in columns, left to right, so every arrow that
// can point forward does: a node's column is the longest path to it from a node
// nothing points at. Within a column, nodes follow the average row of what points
// at them, which keeps most arrows short and uncrossed. Enough for 15-30 nodes;
// no layout library needed.
export interface LayoutNode {
  id: string
  x: number
  y: number
  column: number
}
export interface Layout {
  nodes: LayoutNode[]
  width: number
  height: number
  box: { w: number; h: number }
}

export function layout(
  ids: string[],
  edges: { from: string; to: string }[],
  box = { w: 168, h: 54 },
  gap = { x: 64, y: 18 },
): Layout {
  const out = new Map(ids.map((id) => [id, [] as string[]]))
  const inc = new Map(ids.map((id) => [id, [] as string[]]))
  for (const e of edges) {
    if (!out.has(e.from) || !out.has(e.to) || e.from === e.to) continue
    out.get(e.from)!.push(e.to)
    inc.get(e.to)!.push(e.from)
  }

  // Longest path from the sources, skipping edges that would close a cycle.
  const column = new Map<string, number>()
  const visiting = new Set<string>()
  const depth = (id: string): number => {
    if (column.has(id)) return column.get(id)!
    visiting.add(id)
    const preds = inc.get(id)!.filter((p) => !visiting.has(p))
    const d = preds.length ? Math.max(...preds.map(depth)) + 1 : 0
    visiting.delete(id)
    column.set(id, d)
    return d
  }
  ids.forEach(depth)

  const columns: string[][] = []
  for (const id of ids) (columns[column.get(id)!] ??= []).push(id)
  const row = new Map<string, number>()
  columns.forEach((col, c) => {
    if (c > 0) {
      const avg = (id: string) => {
        const rows = inc.get(id)!.map((p) => row.get(p)).filter((r): r is number => r !== undefined)
        return rows.length ? rows.reduce((a, b) => a + b, 0) / rows.length : Number.MAX_SAFE_INTEGER
      }
      col.sort((a, b) => avg(a) - avg(b))
    }
    col.forEach((id, r) => row.set(id, r))
  })

  const tallest = Math.max(...columns.map((c) => c.length))
  const height = tallest * box.h + (tallest - 1) * gap.y
  const nodes = columns.flatMap((col, c) => {
    const top = (height - (col.length * box.h + (col.length - 1) * gap.y)) / 2
    return col.map((id, r) => ({ id, column: c, x: c * (box.w + gap.x), y: top + r * (box.h + gap.y) }))
  })
  return { nodes, width: columns.length * box.w + (columns.length - 1) * gap.x, height, box }
}

// A curve from the right edge of one box to the left edge of another; arrows that
// stay in a column or go back bend out to the side instead of crossing boxes.
export function edgePath(a: LayoutNode, b: LayoutNode, box: Layout['box']): string {
  const y1 = a.y + box.h / 2
  const y2 = b.y + box.h / 2
  if (b.column > a.column) {
    const x1 = a.x + box.w
    const x2 = b.x
    const mid = (x1 + x2) / 2
    return `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`
  }
  const x = Math.max(a.x, b.x) + box.w
  const bend = x + 40
  return `M${a.x + box.w},${y1} C${bend},${y1} ${bend},${y2} ${b.x + box.w},${y2}`
}
