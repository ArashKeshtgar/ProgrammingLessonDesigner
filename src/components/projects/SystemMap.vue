<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { edgePath, layout } from '../../projects/layout'

export interface MapNode {
  id: string
  label: string
  sub: string
  project: string
  // where it runs: on the VPS, only on the PC, or outside compose altogether
  where: 'vps' | 'pc' | 'external'
  to?: string
}
export interface MapArrow {
  from: string
  to: string
  title: string
}

const props = defineProps<{ nodes: MapNode[]; arrows: MapArrow[]; current?: string; label: string }>()
const router = useRouter()

const PAD = 48 // room for arrows that bend out past the last column
const placed = computed(() => layout(props.nodes.map((n) => n.id), props.arrows))
const at = computed(() => new Map(placed.value.nodes.map((n) => [n.id, n])))
const byId = computed(() => new Map(props.nodes.map((n) => [n.id, n])))
// Each node with its position.
const boxes = computed(() => placed.value.nodes.map((p) => ({ ...p, node: byId.value.get(p.id)! })))
const paths = computed(() =>
  props.arrows
    .filter((a) => at.value.has(a.from) && at.value.has(a.to))
    .map((a) => ({ ...a, d: edgePath(at.value.get(a.from)!, at.value.get(a.to)!, placed.value.box) })),
)
const viewBox = computed(() => `-8 -8 ${placed.value.width + PAD + 16} ${placed.value.height + 16}`)

function go(n: MapNode, e?: Event) {
  e?.preventDefault()
  if (n.to) router.push(n.to)
}
</script>

<template>
  <!-- Always left to right, whatever the page's direction: arrows read as a flow. -->
  <figure class="system-map" dir="ltr">
    <svg :viewBox="viewBox" :aria-label="label" role="group" preserveAspectRatio="xMidYMin meet">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="arrow-head" />
        </marker>
      </defs>
      <path v-for="p in paths" :key="p.from + p.to" :d="p.d" class="arrow" marker-end="url(#arrow)">
        <title>{{ p.title }}</title>
      </path>
      <g
        v-for="b in boxes"
        :key="b.id"
        :class="['node', `accent-${b.node.project}`, `is-${b.node.where}`, { 'is-current': b.id === current, 'is-link': b.node.to }]"
        :transform="`translate(${b.x},${b.y})`"
        :tabindex="b.node.to ? 0 : -1"
        :role="b.node.to ? 'link' : undefined"
        :aria-label="b.node.label"
        @click="go(b.node)"
        @keydown.enter="go(b.node, $event)"
      >
        <rect :width="placed.box.w" :height="placed.box.h" rx="9" />
        <text x="12" y="23" class="node-label">{{ b.node.label }}</text>
        <text x="12" y="41" class="node-sub">{{ b.node.sub }}</text>
      </g>
    </svg>
  </figure>
</template>
