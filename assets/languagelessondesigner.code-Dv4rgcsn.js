const e="languagelessondesigner",n="LanguageLessonDesigner",t={"src/App.vue":29,"index.html":31,"package.json":28,"vite.config.ts":190,"server/merge.test.mjs":40,"server/merge.mjs":77,"src/router/index.ts":61,"src/types/unit.ts":146,"src/lib/units.ts":58,"src/lib/drafts.ts":49,"src/views/LessonListView.vue":117,"src/views/LessonView.vue":76,"src/lib/shades.ts":43,"src/lib/mark.ts":5,"src/lib/skills.ts":17,"src/views/LessonEditView.vue":523,"scripts/generate_pdf.py":86,"src/lib/review/cards.ts":125,"src/lib/review/srs.ts":255,"src/views/ReviewSessionView.vue":196,"src/lib/speak.ts":44,"src/views/ReviewView.vue":170,"server/sync.mjs":92,"src/lib/review/sync.ts":98,"src/lib/proverbs.ts":55,"src/types/proverbs.ts":41,"src/views/ProverbsView.vue":85,"src/lib/context.ts":110,"src/components/ctx/CtxGate.vue":33},s={"about/tabs":{file:"src/App.vue",start:11,end:27,code:`<nav class="topbar">
  <div class="topbar-in">
    <span class="brand">{{ brand }}</span>
    <RouterLink to="/" class="tab" :class="{ on: section === 'lessons' }">
      <b>درس‌ها</b><small>Lessons</small>
    </RouterLink>
    <RouterLink to="/review" class="tab" :class="{ on: section === 'review' }">
      <b>مرور</b><small>Review</small>
    </RouterLink>
    <RouterLink to="/context" class="tab" :class="{ on: section === 'context' }">
      <b>کانتکست</b><small>Context</small>
    </RouterLink>
    <RouterLink to="/proverbs" class="tab" :class="{ on: section === 'proverbs' }">
      <b>ضرب‌المثل</b><small>Proverbs</small>
    </RouterLink>
  </div>
</nav>`},"about/ctxhead":{file:"index.html",start:18,end:24,code:`if (location.hostname.startsWith('ctx.')) {
  document.getElementById('manifest').href = '/manifest-ctx.json'
  document.getElementById('touch-icon').href = '/ctx-apple-touch-icon.png'
  document.getElementById('app-title').content = 'Context'
  document.getElementById('theme').content = '#22303d'
  document.title = 'Context'
}`},"run/scripts":{file:"package.json",start:6,end:13,code:`"scripts": {
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview",
  "build:pages": "vue-tsc -b && vite build --base=/LanguageLessonDesigner/",
  "deploy": "npm run build:pages && gh-pages -d dist",
  "sync": "node server/sync.mjs",
  "test": "node --test server/"`},"run/proxy":{file:"vite.config.ts",start:179,end:190,code:`export default defineConfig({
  plugins: [vue(), lessonApiPlugin(), contextApiPlugin()],
  server: {
    // Review sync: \`npm run sync\` starts server/sync.mjs on :8787 (key in server/data/key).
    proxy: { '/api/sync': 'http://127.0.0.1:8787' },
    watch: {
      // PDFs aren't part of the module graph — writing one (e.g. from the
      // publish API above) shouldn't trigger a full page reload.
      ignored: ['**/public/pdf/**'],
    },
  },
})`},"tests/reset":{file:"server/merge.test.mjs",start:23,end:31,code:`test('reset drops older cards and all day logs; a stale device cannot bring them back', () => {
  let d = mergeUpload(emptyDoc(), { dev: 'phone', cards: { a: card(10) }, days: { 100: { n: 1, r: 0, ok: 1 } } })
  d = mergeUpload(d, { dev: 'pc01', resetAt: 50, cards: { b: card(60) } })
  assert.deepEqual(Object.keys(d.cards), ['b'])
  assert.deepEqual(d.days, {})
  d = mergeUpload(d, { dev: 'phone', resetAt: 0, cards: { a: card(10) }, days: { 100: { n: 1, r: 0, ok: 1 } } })
  assert.deepEqual(Object.keys(d.cards), ['b'])
  assert.deepEqual(d.days, {})
})`},"tests/days":{file:"server/merge.test.mjs",start:15,end:21,code:`test('days: each device keeps its own log; re-sends are harmless', () => {
  let d = mergeUpload(emptyDoc(), { dev: 'phone', days: { 100: { n: 3, r: 2, ok: 4 } } })
  d = mergeUpload(d, { dev: 'pc01', days: { 100: { n: 5, r: 0, ok: 5, fin: true } } })
  d = mergeUpload(d, { dev: 'phone', days: { 100: { n: 3, r: 2, ok: 4 } } })
  assert.deepEqual(d.days.phone[100], { n: 3, r: 2, ok: 4 })
  assert.deepEqual(d.days.pc01[100], { n: 5, r: 0, ok: 5, fin: true })
})`},"routes/routes":{file:"src/router/index.ts",start:12,end:30,code:`const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView, meta: { section: 'lessons' } },
    { path: '/lesson/:id', name: 'lesson', component: LessonView, meta: { section: 'lessons' } },
    { path: '/lesson/:id/edit', name: 'lesson-edit', component: LessonEditView, meta: { section: 'lessons' } },
    { path: '/context', name: 'context', component: () => import('../views/ContextHomeView.vue'), meta: { section: 'context' } },
    { path: '/context/p/:key', name: 'context-pack', component: () => import('../views/ContextPackView.vue'), meta: { section: 'context' } },
    { path: '/context/gaps', component: () => import('../views/ContextListView.vue'), meta: { section: 'context', list: 'gaps' } },
    { path: '/context/bugs', component: () => import('../views/ContextListView.vue'), meta: { section: 'context', list: 'bugs' } },
    { path: '/context/work', component: () => import('../views/ContextListView.vue'), meta: { section: 'context', list: 'work' } },
    { path: '/context/recruit', component: () => import('../views/ContextRecruitView.vue'), meta: { section: 'context' } },
    // Proverbs: public data, bundled as its own lazy chunk (src/data/proverbs.json from the proverb engine).
    { path: '/proverbs', name: 'proverbs', component: () => import('../views/ProverbsView.vue'), meta: { section: 'proverbs' } },
    // Review: spaced-repetition plan over lessons + proverbs; progress in localStorage.
    { path: '/review', name: 'review', component: () => import('../views/ReviewView.vue'), meta: { section: 'review' } },
    { path: '/review/session', component: () => import('../views/ReviewSessionView.vue'), meta: { section: 'review' } },
    { path: '/proverbs/practice', component: () => import('../views/ProverbsPracticeView.vue'), meta: { section: 'proverbs' } },
  ],`},"routes/ctxstart":{file:"src/router/index.ts",start:41,end:43,code:`router.beforeEach((to, from) => {
  if (from === START_LOCATION && to.path === '/' && location.hostname.startsWith('ctx.')) return '/context'
})`},"unit/unit":{file:"src/types/unit.ts",start:117,end:137,code:`export interface Unit {
  _id: string
  n: number
  hue: Hue
  tag: string
  en: string
  fa: string
  src: [string, string][]
  books?: Record<string, number[]>
  chain?: { prev?: string; now?: string; next?: string }
  story: string
  dialog: Dialog
  grammar: Grammar
  colls: Colls
  vocab: Vocab
  cert?: Cert
  listen: Listen
  prod: Prod
  plan?: Record<string, number>
  take: string
  quiz: QuizItem[]`},"unit/glob":{file:"src/lib/units.ts",start:4,end:8,code:`const modules = import.meta.glob<{ default: Unit }>('../data/units/u*.json', { eager: true })

const units: Unit[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.n - b.n)`},"drafts/drafts":{file:"src/lib/drafts.ts",start:3,end:12,code:`const KEY_PREFIX = 'lld:draft:'

export function loadDraft(id: string): Unit | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id)
    return raw ? (JSON.parse(raw) as Unit) : null
  } catch {
    return null
  }
}`},"drafts/list":{file:"src/lib/units.ts",start:10,end:22,code:`export function listUnits(): UnitIndexEntry[] {
  const fromFiles = units.map((u) => {
    const draft = loadDraft(u._id)
    const active = draft || u
    return { id: u._id, n: active.n, tag: active.tag, en: active.en, fa: active.fa }
  })
  const fileIds = new Set(units.map((u) => u._id))
  const draftOnly = listDraftIds()
    .filter((id) => !fileIds.has(id))
    .map((id) => loadDraft(id))
    .filter((d): d is Unit => !!d)
    .map((d) => ({ id: d._id, n: d.n, tag: d.tag, en: d.en, fa: d.fa }))
  return [...fromFiles, ...draftOnly].sort((a, b) => a.n - b.n)`},"drafts/create":{file:"src/views/LessonListView.vue",start:14,end:27,code:`function createLesson() {
  const id = window.prompt('شناسه‌ی درس جدید (مثلاً u416):')?.trim()
  if (!id) return
  if (!/^u[a-z0-9]+$/i.test(id)) {
    window.alert('شناسه باید با u شروع بشه و فقط حرف/عدد باشه، مثل u416.')
    return
  }
  if (getUnit(id)) {
    window.alert('این شناسه از قبل استفاده شده.')
    return
  }
  const maxN = Math.max(0, ...allUnits().map((u) => u.n))
  saveDraft(id, blankUnit(id, maxN + 1))
  router.push(\`/lesson/\${id}/edit\`)`},"render/sections":{file:"src/views/LessonView.vue",start:57,end:70,code:`<HeroBlock :unit="unit" />
<StorySection :story="unit.story" />
<DialogSection :dialog="unit.dialog" />
<GrammarSection :grammar="unit.grammar" />
<CollocationsSection :colls="unit.colls" />
<VocabSection :vocab="unit.vocab" />
<CertSection v-if="unit.cert" :cert="unit.cert" />
<ListenSection :listen="unit.listen" />
<ProdSection :prod="unit.prod" />
<div class="take">
  <b>جمله‌ی مصاحبه:</b>
  <div class="en">{{ unit.take }}</div>
</div>
<QuizSection :quiz="unit.quiz" :n="unit.n" />`},"render/hue":{file:"src/views/LessonView.vue",start:22,end:32,code:`const rootStyle = computed(() => {
  if (!unit.value) return {}
  const c = shades(unit.value.hue)
  return {
    '--hero': c.hero,
    '--hero-sub': c.sub,
    '--hero-txt': c.txt,
    '--chip': c.chip,
    '--chip-ink': c.chipInk,
  }
})`},"render/mark":{file:"src/lib/mark.ts",start:2,end:5,code:`export function mark(s: string): string {
  if (!s) return ''
  return s.replace(/\\[\\[([gcwx]):(.+?)\\]\\]/g, (_m, k, txt) => \`<b class="\${k}">\${txt}</b>\`)
}`},"edit/watch":{file:"src/views/LessonEditView.vue",start:183,end:190,code:`watch(
  unit,
  () => {
    saveDraft(id, JSON.parse(JSON.stringify(unit)))
    draftActive.value = true
  },
  { deep: true },
)`},"edit/stale":{file:"src/views/LessonEditView.vue",start:25,end:28,code:`const fileVersion = getOriginalUnit(id)
if (fileVersion && hasDraft(id) && JSON.stringify(loadDraft(id)) === JSON.stringify(fileVersion)) {
  clearDraft(id)
}`},"edit/publish":{file:"src/views/LessonEditView.vue",start:153,end:161,code:`async function publish() {
  publishing.value = true
  publishError.value = ''
  publishMsg.value = ''
  try {
    const res = await fetch(\`/api/save-lesson/\${id}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(unit),`},"publish/guard":{file:"vite.config.ts",start:115,end:124,code:`// CSRF guard: any website open while \`vite dev\` runs could otherwise
// POST here (a text/plain "simple request" needs no CORS preflight)
// and overwrite a lesson — which is rendered with v-html — and run
// the PDF script. Only the edit form's own same-origin JSON fetch passes.
if (!isTrustedOrigin(req.headers.origin, req.headers.host) ||
    !(req.headers['content-type'] || '').startsWith('application/json')) {
  res.statusCode = 403
  res.end(JSON.stringify({ ok: false, error: 'forbidden' }))
  return
}`},"publish/origin":{file:"vite.config.ts",start:13,end:22,code:`function isTrustedOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin || !host) return false
  try {
    const u = new URL(origin)
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)
    return loopback && u.host === host
  } catch {
    return false
  }
}`},"publish/ladder":{file:"scripts/generate_pdf.py",start:47,end:52,code:`for fs in unit_mod.LADDER:
    open(probe + ".html", "w", encoding="utf-8").write(unit_mod.page(U, fs, quiz=False, name=name))
    n = unit_mod.build.to_pdf(probe + ".html", probe + ".pdf")
    if 0 < n <= (U.get("want") or unit_mod.WANT):
        chosen_fs = fs
        break`},"cards/ids":{file:"src/lib/review/cards.ts",start:79,end:87,code:`for (const q of u.quiz) {
  if (q.old) continue
  out.push({
    ...base, id: \`\${u._id}:q:\${plain(q.q)}\`, kind: 'quiz', order: order(),
    front: q.q, hint: q.qfa || q.fa,
    answer: q.a, answerFa: q.afa, options: q.op ? shuffle(q.op) : undefined,
    typed: !q.op, speak: q.op || !q.q.includes('______') ? undefined : plain(q.q.replace('______', q.a)),
  })
}`},"cards/filter":{file:"src/lib/review/cards.ts",start:104,end:112,code:`// Draft-tagged units (e.g. u06, an older copy of u201) stay out of review.
export function allCards(): Card[] {
  if (!cache) {
    cache = [
      ...allUnits().filter((u) => !/draft/i.test(u.tag)).flatMap(unitCards),
      ...proverbCards(),
    ]
  }
  return cache`},"srs/grade":{file:"src/lib/review/srs.ts",start:82,end:102,code:`export function grade(id: string, g: Grade, wasNew: boolean): void {
  const d = today()
  const s = store.cards[id] || { due: d, ivl: 0, ease: 2.5, reps: 0, lapses: 0, seen: d }
  const fuzz = (n: number) => (n < 3 ? n : Math.round(n * (0.95 + Math.random() * 0.1)))
  if (g === 0) {
    s.lapses += s.reps > 0 ? 1 : 0
    s.reps = 0
    s.ivl = 1
    s.ease = Math.max(1.3, s.ease - 0.2)
  } else {
    if (g === 1) {
      s.ivl = Math.max(1, Math.round(s.ivl * 1.2))
      s.ease = Math.max(1.3, s.ease - 0.15)
    } else if (s.reps === 0) s.ivl = g === 3 ? 4 : 1
    else if (s.reps === 1) s.ivl = g === 3 ? 6 : 3
    else s.ivl = Math.round(s.ivl * s.ease * (g === 3 ? 1.3 : 1))
    if (g === 3) s.ease += 0.15
    s.ivl = Math.min(365, fuzz(Math.max(1, s.ivl)))
    s.reps++
  }
  s.due = d + s.ivl`},"srs/plan":{file:"src/lib/review/srs.ts",start:115,end:126,code:`export function plan(): Plan {
  const d = today()
  const st = store.settings
  const cards = cardsFor(st)
  const due = cards.filter((c) => store.cards[c.id] && store.cards[c.id].due <= d)
    .sort((a, b) => store.cards[a.id].due - store.cards[b.id].due)
    .slice(0, st.maxReviews)
  const introduced = (src: 'pv' | 'lesson') => Object.entries(store.cards)
    .filter(([id, s]) => s.seen === d && (src === 'pv') === id.startsWith('pv:')).length
  const unseen = cards.filter((c) => !store.cards[c.id]).sort((a, b) => a.order - b.order)
  const lessonNew = unseen.filter((c) => c.src !== 'pv').slice(0, Math.max(0, st.newLessons - introduced('lesson')))
  const pvNew = unseen.filter((c) => c.src === 'pv').slice(0, Math.max(0, st.newProverbs - introduced('pv')))`},"session/mode":{file:"src/views/ReviewSessionView.vue",start:54,end:61,code:`const mode = computed<'choice' | 'typed' | 'recall'>(() => {
  const it = cur.value
  if (!it) return 'recall'
  const s = store.cards[it.c.id]
  if (it.c.options && (it.c.kind !== 'word' || !s || s.reps < 2)) return 'choice'
  if (it.c.typed) return 'typed'
  return 'recall'
})`},"session/check":{file:"src/views/ReviewSessionView.vue",start:74,end:80,code:`function check() {
  // Answers are often fragments ("is waiting"), so a full sentence that contains them counts.
  const t = \` \${normA(typedAns.value)} \`
  const a = normA(cur.value.c.answer)
  verdict.value = !!a && t.trim() !== '' && t.includes(a.startsWith("'") ? \`\${a} \` : \` \${a} \`) // 'm finishing ⊂ I'm finishing
  reveal.value = true
  sayAnswer()`},"session/voice":{file:"src/lib/speak.ts",start:5,end:15,code:`function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices()
  const want = new RegExp(lang.replace('-', '[-_]'), 'i')
  return (
    voices.find((v) => want.test(v.lang) && /Natural|Online/i.test(v.name)) ||
    voices.find((v) => want.test(v.lang)) ||
    voices.find((v) => /Aria|Jenny|Guy|Natural/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0]
  )
}`},"progress/streak":{file:"src/lib/review/srs.ts",start:146,end:154,code:`export function streak(): number {
  const d = today()
  // A day counts when you hit the goal, or finished everything planned (a light day).
  const done = (x: number) => { const l = dayTotal(x); return !!l.fin || l.n + l.r >= store.settings.goal }
  let k = done(d) ? d : d - 1 // today still counts as "open" until midnight
  let n = 0
  while (done(k)) { n++; k-- }
  return n
}`},"progress/ics":{file:"src/lib/review/srs.ts",start:241,end:254,code:"export function reminderIcs(url: string): string {\n  const [h, m] = store.settings.remind.split(':').map(Number)\n  const d = new Date()\n  const p = (n: number) => String(n).padStart(2, '0')\n  const date = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`\n  const t = `${p(h)}${p(m)}00`\n  return [\n    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arash Workbench//Review//EN', 'BEGIN:VEVENT',\n    `UID:review-${date}@workbench`, `DTSTAMP:${date}T000000Z`,\n    `DTSTART:${date}T${t}`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',\n    'SUMMARY:English review (10 min)', `URL:${url}`, `DESCRIPTION:${url}`,\n    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:English review', 'TRIGGER:PT0M', 'END:VALARM',\n    'END:VEVENT', 'END:VCALENDAR',\n  ].join('\\r\\n')"},"syncserver/key":{file:"server/sync.mjs",start:24,end:34,code:`function loadKey() {
  if (process.env.SYNC_KEY) return process.env.SYNC_KEY
  const f = join(DATA, 'key')
  if (!existsSync(f)) {
    writeFileSync(f, randomBytes(24).toString('base64url') + '\\n', { mode: 0o600 })
    console.log(\`generated a sync key in \${f}\`)
  }
  return readFileSync(f, 'utf8').trim()
}
const KEY_HASH = createHash('sha256').update(loadKey()).digest()
const keyOk = (k) => typeof k === 'string' && timingSafeEqual(createHash('sha256').update(k).digest(), KEY_HASH)`},"syncserver/fails":{file:"server/sync.mjs",start:44,end:54,code:`// Wrong keys: 10 per 10 minutes per client address, then 429.
const fails = new Map()
function blocked(ip) {
  const f = fails.get(ip)
  return !!f && f.n >= 10 && Date.now() - f.t < 600000
}
function failed(ip) {
  const f = fails.get(ip)
  if (!f || Date.now() - f.t > 600000) fails.set(ip, { n: 1, t: Date.now() })
  else f.n++
}`},"syncserver/save":{file:"server/sync.mjs",start:38,end:42,code:`function save() {
  const tmp = FILE + '.tmp'
  writeFileSync(tmp, JSON.stringify(doc))
  renameSync(tmp, FILE) // atomic: a crash mid-write never leaves half a file
}`},"merge/cards":{file:"server/merge.mjs",start:33,end:42,code:`export function mergeUpload(doc, up) {
  const out = structuredClone(doc)
  if (!up || typeof up !== 'object') return out
  const upReset = num(up.resetAt)
  if (upReset > out.resetAt) {
    out.resetAt = upReset
    for (const [id, c] of Object.entries(out.cards)) if ((c.t || 0) < upReset) delete out.cards[id]
    out.days = {}
  }
  const stale = upReset < out.resetAt // this device hasn't heard of the latest reset yet`},"merge/days":{file:"server/merge.mjs",start:57,end:67,code:`if (!stale && isDev(up.dev) && up.days && typeof up.days === 'object') {
  const mine = out.days[up.dev] || (out.days[up.dev] = {})
  for (const [day, raw] of Object.entries(up.days)) {
    if (!/^\\d{1,7}$/.test(day)) continue
    const l = cleanDay(raw)
    if (!l) continue
    const h = mine[day]
    // counters only grow on the device that owns them; max() makes re-sends harmless
    mine[day] = h
      ? { n: Math.max(h.n, l.n), r: Math.max(h.r, l.r), ok: Math.max(h.ok, l.ok), ...(h.fin || l.fin ? { fin: true } : {}) }
      : l`},"merge/apply":{file:"src/lib/review/srs.ts",start:218,end:227,code:`export function applyDoc(doc: SyncDoc): void {
  if (doc.resetAt > store.resetAt) {
    store.resetAt = doc.resetAt
    for (const [id, c] of Object.entries(store.cards)) if ((c.t || 0) < doc.resetAt) delete store.cards[id]
    store.days = {}
  }
  for (const [id, c] of Object.entries(doc.cards || {})) {
    const have = store.cards[id]
    if (!have || (c.t || 0) > (have.t || 0)) store.cards[id] = c
  }`},"syncclient/connect":{file:"src/lib/review/sync.ts",start:56,end:64,code:`export async function connect(key: string): Promise<boolean> {
  sync.key = key.trim()
  const ok = await syncNow()
  try {
    if (ok) localStorage.setItem(KEY, sync.key)
  } catch { /* storage unavailable: works until the app closes */ }
  if (!ok) sync.key = ''
  return ok
}`},"syncclient/debounce":{file:"src/lib/review/sync.ts",start:76,end:81,code:`let timer: ReturnType<typeof setTimeout> | undefined
watch(store, () => {
  if (!sync.key) return
  clearTimeout(timer)
  timer = setTimeout(() => { if (sig() !== lastSig) syncNow() }, 3000)
}, { deep: true })`},"syncclient/hidden":{file:"src/lib/review/sync.ts",start:85,end:95,code:`document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && sync.key && sig() !== lastSig) {
    clearTimeout(timer)
    fetch(SYNC_URL, {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', 'X-Sync-Key': sync.key },
      // keepalive bodies are capped at 64 KB: only cards answered since the last good sync
      body: JSON.stringify({ ...uploadPayload(), cards: changedSince(sync.last - 60000) }),
    }).catch(() => { /* next start retries */ })
  } else if (document.visibilityState === 'visible' && sync.key) syncNow()
})`},"proverbs/norm":{file:"src/lib/proverbs.ts",start:11,end:17,code:`export function norm(s: string | undefined): string {
  return (s || '')
    .replace(/[ً-ْ]/g, '')
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ')
    .replace(/[آأإ]/g, 'ا').replace(/ة/g, 'ه')
    .toLowerCase()
}`},"proverbs/matches":{file:"src/lib/proverbs.ts",start:23,end:28,code:`// Every word must start a word in the text — so «آب» doesn't match «کتاب».
export function matches(p: Proverb, q: string): boolean {
  const words = norm(q).replace(/[^\\p{L}\\p{N}\\s]/gu, ' ').split(/\\s+/).filter(Boolean)
  const h = hay.get(p.n) || ''
  return words.every((w) => h.includes(' ' + w))
}`},"proverbs/url":{file:"src/views/ProverbsView.vue",start:30,end:37,code:`watch([q, w, t, daily], () => {
  const query: Record<string, string> = {}
  if (q.value.trim()) query.q = q.value.trim()
  if (w.value) query.w = w.value
  if (t.value) query.t = t.value
  if (daily.value) query.daily = '1'
  router.replace({ query })
})`},"context/engine":{file:"vite.config.ts",start:28,end:29,code:`const CONTEXT_ENGINE =
  process.env.CONTEXT_ENGINE_DIR || 'C:/Users/akesh/Downloads/SmartLedgerAI-JobPrep/Context/engine'`},"context/load":{file:"src/lib/context.ts",start:16,end:32,code:`export async function loadContext(force = false): Promise<void> {
  if (ctx.value && !force) return
  ctxLoading.value = true
  ctxError.value = ''
  try {
    const res = await fetch('/api/context', { cache: 'no-store' })
    const isJson = (res.headers.get('content-type') || '').includes('json')
    if (!import.meta.env.DEV && (res.status === 404 || !isJson)) {
      ctxError.value = 'local-only'
      return
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || \`HTTP \${res.status}\`)
    ctx.value = data as ContextData
  } catch (e) {
    ctxError.value = e instanceof Error ? e.message : String(e)
  } finally {`},"context/local":{file:"vite.config.ts",start:43,end:50,code:`function isLocalRead(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const host = req.headers.host as string | undefined
  const origin = req.headers.origin as string | undefined
  const site = req.headers['sec-fetch-site'] as string | undefined
  if (!isLoopbackHost(host)) return false
  if (origin && !isTrustedOrigin(origin, host)) return false
  return !site || site === 'same-origin' || site === 'none'
}`},"tags/resolve":{file:"src/lib/context.ts",start:53,end:59,code:`let m = s.match(/^([BbWw]):?\\s*0*(\\d+)$/)
if (m) {
  const k = m[1].toUpperCase()
  const n = Number(m[2])
  const row = (k === 'B' ? d.bugs : d.work).find((x) => x.n === n)
  return row ? { kind: k, route: \`/context/\${k === 'B' ? 'bugs' : 'work'}?at=\${row.tag.slice(1)}\`, label: row.fa } : null
}`},"tags/jump":{file:"src/lib/context.ts",start:100,end:110,code:`export function jumpTo(at: unknown): void {
  if (typeof at !== 'string' || !at) return
  requestAnimationFrame(() => {
    const el = document.getElementById(at)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.remove('flash')
    void el.offsetWidth
    el.classList.add('flash')
  })
}`}},r=[],i=[],o=[{path:"/",component:"LessonListView",guards:[]},{path:"/lesson/:id",component:"LessonView",guards:[]},{path:"/lesson/:id/edit",component:"LessonEditView",guards:[]},{path:"/context",component:"ContextHomeView",guards:[]},{path:"/context/p/:key",component:"ContextPackView",guards:[]},{path:"/context/gaps",component:"ContextListView",guards:[]},{path:"/context/bugs",component:"ContextListView",guards:[]},{path:"/context/work",component:"ContextListView",guards:[]},{path:"/context/recruit",component:"ContextRecruitView",guards:[]},{path:"/proverbs",component:"ProverbsView",guards:[]},{path:"/review",component:"ReviewView",guards:[]},{path:"/review/session",component:"ReviewSessionView",guards:[]},{path:"/proverbs/practice",component:"ProverbsPracticeView",guards:[]}],a={project:e,repo:n,files:t,examples:s,endpoints:r,tables:i,routes:o};export{a as default,r as endpoints,s as examples,t as files,e as project,n as repo,o as routes,i as tables};
