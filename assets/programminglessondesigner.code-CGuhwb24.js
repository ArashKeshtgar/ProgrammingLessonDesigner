const e="programminglessondesigner",n="ProgrammingLessonDesigner",t={"README.md":120,"package.json":36,"vite.config.ts":53,"src/main.ts":14,"src/App.vue":19,"src/router/index.ts":33,"src/types/lesson.ts":111,"src/lib/lessons.ts":28,"src/lib/booklets.ts":11,"src/lib/code.ts":107,"src/data/lessons/o004-deploy.json":141,"scripts/check-lessons.mjs":59,"examples/backend/csharp/Portfolio/PortfolioApp.cs":101,"examples/backend/python/portfolio/app.py":83,"examples/backend/typescript/src/app.ts":91,"examples/backend/java/src/main/java/portfolio/PortfolioController.java":62,".github/workflows/deploy-pages.yml":141,"examples/frontend/web/package.json":40,"examples/frontend/web/shared/api.ts":51,"examples/frontend/web/test/api.test.ts":67,"examples/frontend/web/vue/router.ts":25,"examples/docker/compose.yml":65,"examples/ops/Dockerfile":21,"examples/ops/tests/run.sh":237,"examples/ops/deploy/deploy.sh":43,"src/components/LessonBody.vue":98,"src/components/CodeTabs.vue":66,"src/components/CompareTable.vue":29,"src/lib/highlight.ts":43,"src/views/BookletView.vue":45,"scripts/pdf.mjs":39,"src/styles/base/_print.scss":65,"src/lib/review.ts":84,"src/views/ReviewView.vue":85,"public/sw.js":18,"public/manifest.webmanifest":13,"index.html":17,"scripts/project-map.mjs":292,"src/data/project-map.json":898,"src/projects/model.ts":280,"scripts/project-code.mjs":744,"src/data/topics/programminglessondesigner.json":2081,"src/components/projects/DataTable.vue":101,"src/projects/i18n.ts":246,"scripts/check-projects.mjs":151,"src/views/projects/ProjectsView.vue":187,"src/projects/layout.ts":84,"src/components/projects/SystemMap.vue":72,"src/styles/abstracts/_tokens.scss":130,"src/styles/abstracts/_functions.scss":74,"src/styles/base/_theme.scss":33,"src/styles/projects/_accents.scss":47,".stylelintrc.json":52},s={"run/scripts":{file:"package.json",start:6,end:14,code:`"scripts": {
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview",
  "check": "node scripts/check-lessons.mjs && node scripts/check-projects.mjs && node scripts/project-map.mjs --check && node scripts/project-code.mjs --check",
  "pdf": "node scripts/pdf.mjs",
  "map": "node scripts/project-map.mjs",
  "lint:css": "stylelint \\"src/**/*.scss\\"",
  "code": "node scripts/project-code.mjs"`},"run/vite":{file:"vite.config.ts",start:48,end:53,code:`// For a GitHub Pages build pass --base=/ProgrammingLessonDesigner/ on the CLI.
export default defineConfig({
  plugins: [vue(), topicIndex()],
  // Sass's modern API; the legacy one is deprecated and prints a warning per file.
  css: { preprocessorOptions: { scss: { api: 'modern' } } },
})`},"shell/tabs":{file:"src/App.vue",start:10,end:17,code:`<nav class="topbar">
  <div class="topbar-in">
    <RouterLink to="/" class="brand">Programming · Lessons</RouterLink>
    <RouterLink to="/" class="tab" :class="{ on: section === 'lessons' }">درس‌ها</RouterLink>
    <RouterLink to="/review" class="tab" :class="{ on: section === 'review' }">مرور</RouterLink>
    <RouterLink to="/projects" class="tab" :class="{ on: section === 'projects' }">پروژه‌ها</RouterLink>
  </div>
</nav>`},"shell/router":{file:"src/router/index.ts",start:8,end:21,code:`// Hash history keeps deep links working on GitHub Pages with no rewrite rules.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'lessons', component: LessonListView },
    { path: '/lesson/:id', name: 'lesson', component: LessonView },
    { path: '/booklet/:tag', name: 'booklet', component: () => import('../views/BookletView.vue') },
    { path: '/review', name: 'review', component: () => import('../views/ReviewView.vue') },
    // The Projects tab: the language is part of the address, so a link keeps it.
    { path: '/projects', redirect: () => \`/projects/\${savedLang()}\` },
    { path: '/projects/:lang(fa|en)/:page?/:topic?', name: 'projects', component: () => import('../views/projects/ProjectsView.vue') },
  ],
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
})`},"shell/title":{file:"src/router/index.ts",start:23,end:31,code:"router.afterEach((to) => {\n  const APP = 'Programming Lessons'\n  let page = ''\n  if (to.name === 'lesson') page = getLesson(String(to.params.id))?.en ?? ''\n  if (to.name === 'booklet') page = `${BOOKLETS[String(to.params.tag)]?.title ?? to.params.tag} booklet`\n  if (to.name === 'review') page = 'Review'\n  if (to.name === 'projects') page = 'Projects' // ProjectsView puts the page's own name in front\n  document.title = page ? `${page} · ${APP}` : `${APP} · درس‌های برنامه‌نویسی`\n})"},"shape/lesson":{file:"src/types/lesson.ts",start:81,end:103,code:`export interface Lesson {
  _id: string
  n: number
  // Booklet the lesson belongs to: backend, frontend, docker, ops.
  tag: string
  topics: string[]
  // Columns of the compare table and tabs of the code blocks; defaults to the four backend languages.
  langs?: Lang[]
  // The column the reader already knows (highlighted); defaults to csharp.
  known?: Lang
  en: string
  fa: string
  goal: string[]
  story: string
  why: [string, string][]
  concepts: Concept[]
  compare: CompareRow[]
  code: CodeSample[]
  pitfalls: Pitfall[]
  refs: CodeRef[]
  exercises: Exercise[]
  take: string
}`},"shape/compare":{file:"src/types/lesson.ts",start:36,end:37,code:'// One concept, several languages. `diff` is the one-line "what really differs".\nexport type CompareRow = { concept: string; diff: string } & Partial<Record<Lang, string>>'},"shape/sort":{file:"src/lib/lessons.ts",start:6,end:10,code:`// Booklet order first (each booklet numbers its lessons from 1), then lesson number.
const bookletOrder = Object.keys(BOOKLETS)
const lessons: Lesson[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => bookletOrder.indexOf(a.tag) - bookletOrder.indexOf(b.tag) || a.n - b.n)`},"samples/sample":{file:"src/types/lesson.ts",start:39,end:53,code:`// Samples sharing a \`group\` render as one tabbed block, one tab per language.
// The code is either inline (\`code\`, for a quote from a real project) or read at build
// time from a tested file under examples/ (\`file\`, optionally cut to one \`region\`).
export interface CodeSample {
  group: string
  // 'all' = one sample that is the same for every language (a compose file); shown without tabs.
  lang: Lang | 'all'
  title: string
  // 'real' = shortened from a project file (see refs); 'tested' = a file under examples/
  // that the CI builds and tests; 'port' = written for the lesson, not run.
  origin: 'real' | 'tested' | 'port'
  code?: string
  file?: string
  region?: string
}`},"samples/json":{file:"src/data/lessons/o004-deploy.json",start:78,end:80,code:`{ "group": "lock", "lang": "bash", "title": "یک deploy در هر لحظه", "origin": "tested", "file": "ops/deploy/deploy.sh", "region": "lock" },
{ "group": "lock", "lang": "powershell", "title": "یک deploy در هر لحظه", "origin": "tested", "file": "ops/deploy/deploy.ps1", "region": "lock" },
{ "group": "lock", "lang": "python", "title": "یک deploy در هر لحظه", "origin": "tested", "file": "ops/deploy/deploy.py", "region": "lock" },`},"samples/extract":{file:"src/lib/code.ts",start:29,end:50,code:`// The lines between "#region <name>" and its "#endregion" (any comment syntax),
// without nested region markers, dedented.
export function extractRegion(text: string, name: string): string | undefined {
  const lines = text.split(/\\r?\\n/)
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
}`},"checks/langs":{file:"scripts/check-lessons.mjs",start:26,end:41,code:'const groups = {}\nfor (const s of l.code ?? []) {\n  ;(groups[s.group] ??= []).push(s.lang)\n  if (s.lang !== \'all\' && !langs.includes(s.lang)) at(`code group "${s.group}" has a ${s.lang} tab the lesson does not list`)\n  if (!s.code && !s.file) at(`code "${s.group}/${s.lang}" has neither code nor file`)\n  if (s.file) {\n    const file = path.join(root, \'examples\', s.file)\n    if (!existsSync(file)) at(`example not found: examples/${s.file}`)\n    else if (s.region && !new RegExp(`#region\\\\s+${s.region}\\\\b`).test(readFileSync(file, \'utf-8\')))\n      at(`region "${s.region}" not found in examples/${s.file}`)\n  }\n}\nfor (const [g, have] of Object.entries(groups))\n  if (!have.includes(\'all\'))\n    for (const lang of langs) if (!have.includes(lang)) at(`code group "${g}" has no ${lang}`)\nfor (const r of l.compare ?? []) for (const lang of langs) if (!r[lang]) at(`compare "${r.concept}" has no ${lang}`)'},"checks/refs":{file:"scripts/check-lessons.mjs",start:43,end:52,code:"if (existsSync(refsRoot))\n  for (const r of l.refs ?? []) {\n    const file = path.join(refsRoot, r.project, r.file)\n    if (!existsSync(file)) {\n      at(`ref not found: ${r.project}/${r.file}`)\n      continue\n    }\n    const lines = readFileSync(file, 'utf-8').split('\\n').length\n    if (r.line && r.line > lines) at(`ref ${r.project}/${r.file}:${r.line} is past the end (${lines} lines)`)\n  }"},"checks/fail":{file:"scripts/check-lessons.mjs",start:55,end:59,code:`if (problems.length) {
  console.error(problems.join('\\n'))
  process.exit(1)
}
console.log(\`lessons ok (\${ids.size})\`)`},"backend/cs":{file:"examples/backend/csharp/Portfolio/PortfolioApp.cs",start:42,end:60,code:`app.MapGet("/status", async (IStatusQueries q) =>
{
    try
    {
        var s = await q.StatusAsync();
        var m = new { sent = s.Sent ?? 0, interviewing = s.Interviewing ?? 0, followupsDue = s.FollowupsDue ?? 0 };
        return Results.Ok(new { healthy = true, summary = $"{m.sent} sent, {m.interviewing} interviewing, {m.followupsDue} follow-up(s) due", metrics = m });
    }
    catch (Exception)
    {
        // Unhealthy is an answer, not an error: the dashboard shows it.
        return Results.Ok(new { healthy = false, error = "Database unreachable." });
    }
});

app.MapGet("/projects/{key}", async (string key, IProjectRepository repo) =>
    await repo.FindAsync(key) is { } row
        ? Results.Ok(row)
        : Results.NotFound(new { error = $"Unknown project: {key}" }));`},"backend/py":{file:"examples/backend/python/portfolio/app.py",start:56,end:65,code:`@app.get("/status")
def status():
    try:
        s = queries.status()
    except Exception:
        # Unhealthy is an answer, not an error: the dashboard shows it.
        return {"healthy": False, "error": "Database unreachable."}
    m = {k: v or 0 for k, v in s.model_dump().items()}
    summary = f"{m['sent']} sent, {m['interviewing']} interviewing, {m['followups_due']} follow-up(s) due"
    return {"healthy": True, "summary": summary, "metrics": m}`},"backend/job":{file:".github/workflows/deploy-pages.yml",start:20,end:31,code:`python:
  runs-on: ubuntu-latest
  services:
    mongo: { image: "mongo:7", ports: ["27017:27017"] }
  defaults: { run: { working-directory: examples/backend/python } }
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with: { python-version: "3.12", cache: pip, cache-dependency-path: examples/backend/python/requirements.txt }
    - run: pip install -r requirements.txt
    - run: pytest -q
      env: { MONGO_URL: "mongodb://localhost:27017" }`},"frontend/refresh":{file:"examples/frontend/web/test/api.test.ts",start:20,end:38,code:`it('refreshes once for parallel 401s and retries each request', async () => {
  const { s, tokens } = store('old', 'r1')
  let refreshes = 0
  const fake = async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url)
    if (u.endsWith('/auth/refresh')) {
      refreshes++
      await new Promise((r) => setTimeout(r, 10)) // still in flight when the second 401 arrives
      return json(200, { accessToken: 'new', refreshToken: 'r2' })
    }
    const auth = (init?.headers as Record<string, string>)?.Authorization
    return auth === 'Bearer new' ? json(200, { path: u }) : json(401, { error: 'expired' })
  }
  const api = createApi('http://api', tokens, () => assert.fail('should stay signed in'), fake as typeof fetch)
  const [a, b] = await Promise.all([api<{ path: string }>('/projects'), api<{ path: string }>('/status')])
  assert.equal(refreshes, 1)
  assert.deepEqual([a.path, b.path], ['http://api/projects', 'http://api/status'])
  assert.equal(s.refresh, 'r2')
})`},"frontend/guard":{file:"examples/frontend/web/vue/router.ts",start:12,end:24,code:`export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/dashboard', component: () => import('./StatusList.vue') },
    { path: '/projects/new', component: () => import('./ProjectForm.vue'), meta: { role: 'Admin' } },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

// One global guard reads each route's meta; returning a path redirects.
router.beforeEach((to) => {
  if (to.meta.role && session.role !== to.meta.role) return '/dashboard'
})`},"docker/secrets":{file:"examples/docker/compose.yml",start:8,end:10,code:"x-secrets: &secrets\n  JWT_SECRET: ${JWT_SECRET:?set JWT_SECRET to a random value of 32+ characters}\n  JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?set JWT_REFRESH_SECRET to a different random value of 32+ characters}"},"docker/job":{file:".github/workflows/deploy-pages.yml",start:86,end:93,code:`- name: Build the four images and wait for them to be healthy
  run: |
    export JWT_SECRET=$(openssl rand -base64 48) JWT_REFRESH_SECRET=$(openssl rand -base64 48)
    docker compose -f examples/docker/compose.yml up --build --wait --wait-timeout 300
    for port in 8081 8082 8083 8084; do curl -fsS "http://localhost:$port/status"; echo; done
- name: Compose refuses to start without the secrets
  run: |
    if docker compose -f examples/docker/compose.yml config > /dev/null 2>&1; then echo "expected a failure"; exit 1; fi`},"docker/mongo":{file:"examples/docker/compose.yml",start:46,end:54,code:`image: mongo:7
# No "ports": Mongo is not published on the host; only services on "internal" reach it.
volumes: [mongo-data:/data/db]
networks: [internal]
healthcheck:
  test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
  interval: 5s
  retries: 10
`},"ops/image":{file:"examples/ops/Dockerfile",start:4,end:11,code:`FROM ubuntu:24.04

RUN apt-get update \\
 && apt-get install -y --no-install-recommends ca-certificates curl git openssh-client openssh-server python3 sqlite3 \\
 && curl -fsSL -o /tmp/microsoft.deb https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb \\
 && dpkg -i /tmp/microsoft.deb && rm /tmp/microsoft.deb \\
 && apt-get update && apt-get install -y --no-install-recommends powershell \\
 && rm -rf /var/lib/apt/lists/*`},"ops/check":{file:"examples/ops/tests/run.sh",start:13,end:30,code:`# check <name> <exit: a number, or "fail" for any non-zero> <text the output must
# contain, or "!text" it must not> -- <command...>
check() {
  local name="$1" want="$2" text="$3" out code ok=true
  shift 4
  out="$("$@" 2>&1)"
  code=$?
  if [[ "$want" == fail ]]; then [[ $code -ne 0 ]] || ok=false; else [[ $code -eq $want ]] || ok=false; fi
  if [[ "$text" == !* ]]; then [[ "$out" != *"\${text:1}"* ]] || ok=false; else [[ "$out" == *"$text"* ]] || ok=false; fi
  if $ok; then
    echo "  ok    $name"
    passed=$((passed + 1))
  else
    echo "  FAIL  $name (exit $code, wanted $want)"
    printf '%s\\n' "$out" | sed 's/^/          /'
    failed=$((failed + 1))
  fi
}`},"ops/forced":{file:"examples/ops/tests/run.sh",start:227,end:228,code:`check "no command: it deploys" 0 "deploying (asked for: nothing)" -- ci_ssh /tmp/ci/known_hosts deployer@localhost
check "another command: it still only deploys" 0 "deploying (asked for: cat /etc/shadow)" -- ci_ssh /tmp/ci/known_hosts deployer@localhost 'cat /etc/shadow'`},"ops/summary":{file:"examples/ops/tests/run.sh",start:236,end:237,code:`echo "$passed passed, $failed failed"
[[ $failed -eq 0 ]]`},"page/groups":{file:"src/components/LessonBody.vue",start:13,end:18,code:`// Samples that share a \`group\` render as one block, in file order.
const groups = computed(() => {
  const map = new Map<string, CodeSample[]>()
  for (const s of props.lesson.code) map.set(s.group, [...(map.get(s.group) ?? []), s])
  return [...map.values()]
})`},"page/origin":{file:"src/components/CodeTabs.vue",start:20,end:24,code:`const ORIGIN: Record<CodeSample['origin'], string> = {
  real: 'از کد واقعی پروژه (کوتاه‌شده)',
  tested: 'کد اجراشده و تست‌شده در examples/',
  port: 'معادل نوشته‌شده، اجرا نشده',
}`},"page/copy":{file:"src/components/CodeTabs.vue",start:27,end:35,code:`async function copy(s: CodeSample) {
  try {
    await navigator.clipboard.writeText(sampleCode(s))
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // clipboard can be blocked (insecure context); the code stays selectable
  }
}`},"booklets/print":{file:"scripts/pdf.mjs",start:17,end:22,code:`for (const tag of BOOKLETS) {
  // A fresh page per booklet: only the #hash differs, and a same-page hash change is not a load.
  const page = await browser.newPage()
  await page.goto(\`\${site}#/booklet/\${tag}\`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.booklet-lesson')
  await page.evaluate(() => document.fonts.ready)`},"booklets/pdfbase":{file:"src/lib/booklets.ts",start:9,end:11,code:"// Where the booklet PDFs live. CI prints them next to the site (GitHub Pages); a build\n// elsewhere (the VPS) has no PDFs of its own and points at those with VITE_PDF_BASE.\nexport const PDF_BASE: string = import.meta.env.VITE_PDF_BASE || `${import.meta.env.BASE_URL}pdf/`"},"review/grade":{file:"src/lib/review.ts",start:70,end:74,code:`export function grade(state: Record<string, CardState>, id: string, knew: boolean, now = Date.now()) {
  const box = knew ? Math.min((state[id]?.box ?? 0) + 1, INTERVAL_DAYS.length - 1) : 1
  state[id] = { box, due: now + INTERVAL_DAYS[box] * DAY }
  saveState(state)
}`},"review/due":{file:"src/lib/review.ts",start:76,end:80,code:`export function dueCards(cards: Card[], state: Record<string, CardState>, now = Date.now(), newPerDay = 15): Card[] {
  const due = cards.filter((c) => state[c.id] && state[c.id].due <= now)
  const fresh = cards.filter((c) => !state[c.id]).slice(0, newPerDay)
  return [...due, ...fresh]
}`},"review/load":{file:"src/lib/review.ts",start:54,end:60,code:`export function loadState(): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {} // storage blocked or corrupted: start fresh, the page still works
  }
}`},"offline/sw":{file:"public/sw.js",start:1,end:18,code:`// Minimal offline shell: network first, fall back to the last copy of anything fetched.
const CACHE = 'pld-v1'
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
))
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      })
      .catch(() => caches.match(e.request)),
  )
})`},"offline/register":{file:"src/main.ts",start:11,end:14,code:"// Installable app: the service worker caches what was fetched, so lessons open offline.\nif ('serviceWorker' in navigator && import.meta.env.PROD) {\n  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})\n}"},"map/sources":{file:"scripts/project-map.mjs",start:22,end:28,code:`const SOURCES = {
  base: 'docker-compose.yml',
  apps: 'compose.apps.yml',
  vps: 'deploy/vps/compose.vps.yml',
  caddy: 'deploy/vps/Caddyfile',
  env: 'deploy/vps/.env.vps.example',
}`},"map/owner":{file:"scripts/project-map.mjs",start:242,end:244,code:`// A database named after a project's repo (LedgerDashboard, LabFlow) is that
// project's data, whichever server it lives on: reading it links the two projects.
const dbOwner = (db) => Object.keys(PROJECTS).find((id) => PROJECTS[id].repo === db)`},"map/sites":{file:"scripts/project-map.mjs",start:214,end:226,code:`for (const m of caddyfile.matchAll(/^\\{\\$([A-Z_]+_DOMAIN)\\} \\{\\n([\\s\\S]*?)\\n\\}/gm)) {
  const [, domainVar, body] = m
  const sub = envExample[domainVar] ?? /:-([a-z]+)\\./.exec(caddyEnv[domainVar] ?? '')?.[1]
  const targets = [...body.matchAll(/reverse_proxy ([\\w-]+):\\d+/g)].map((x) => x[1])
  const files = /root \\* /.test(body)
  for (const t of new Set(targets)) link('caddy', t, \`\${sub}.\${baseDomain}\`)
  sites.push({
    domain: \`\${sub}.\${baseDomain}\`,
    services: [...new Set(targets)],
    private: /import private/.test(body),
    ...(files ? { files: true } : {}),
  })
}`},"map/check":{file:"scripts/project-map.mjs",start:282,end:288,code:`if (check) {
  const committed = existsSync(out) ? readFileSync(out, 'utf-8') : ''
  if (committed.replace(/\\r\\n/g, '\\n') !== json) {
    console.error('project map: src/data/project-map.json is out of date with Control Panel; run npm run map')
    process.exit(1)
  }
  console.log(\`project map ok (\${projects.length} projects, \${nodes.length} services)\`)`},"topics/types":{file:"src/projects/model.ts",start:106,end:122,code:`export interface TopicExample {
  title: Record<DocLang, string>
  lang: string
  file: string
  from: string
  to?: string
  lines?: number
}
// The quiz at the end of a topic: the same questions in both languages.
export interface QuizQuestion {
  q: Record<DocLang, string>
  options: Record<DocLang, string[]>
  // index of the right option
  answer: number
  why: Record<DocLang, string>
}
export interface Topic {`},"topics/find":{file:"scripts/project-code.mjs",start:685,end:696,code:'const start = src.findIndex((l) => l.includes(ex.from))\nif (start < 0) {\n  at(`${page.id}/${id}: "${ex.from}" not found in ${ex.file}`)\n  continue\n}\n// `to`: up to the first line after `from` that contains it; `lines`: that many lines.\nconst end = ex.lines ? start + ex.lines - 1 : ex.to ? src.findIndex((l, i) => i >= start && l.includes(ex.to)) : start\nif (end < 0 || end >= src.length) {\n  at(`${page.id}/${id}: "${ex.to}" not found after "${ex.from}" in ${ex.file}`)\n  continue\n}\nexamples[`${page.id}/${id}`] = { file: ex.file, start: start + 1, end: end + 1, code: dedent(src.slice(start, end + 1)) }'},"scanners/vue":{file:"scripts/project-code.mjs",start:544,end:556,code:`// Vue Router: { path: '...', component: Page }, a page loaded on demand,
// component: () => import('../views/Page.vue'), or a redirect (a fixed path, or the
// template string a function returns, shown as written).
function vueRoutes(repo, file) {
  return lines(readFileSync(path.join(repo, file), 'utf-8')).flatMap((l) => {
    const p = /\\{ path: '([^']*)'/.exec(l)
    if (!p) return []
    const page = /component: (?:\\(\\) => import\\('[^']*\\/(\\w+)\\.vue'\\)|(\\w+))/.exec(l)
    if (page) return [{ path: p[1], component: page[1] ?? page[2], guards: [] }]
    const to = /redirect: (?:'([^']*)'|\\(\\) => \`([^\`]*)\`)/.exec(l)
    return to ? [{ path: p[1], redirect: to[1] ?? to[2], guards: [] }] : []
  })
}`},"scanners/aspnet":{file:"scripts/project-code.mjs",start:490,end:495,code:`// The endpoint's own policy is on its last line: the first one, before the next endpoint, that names one.
const until = found[k + 1]?.line ?? src.length
const auth = src.slice(e.line, until).map((l) => AUTH.exec(l)).find(Boolean)
const tag = src.slice(e.line, until).map((l) => TAG.exec(l)?.[1]).find(Boolean)
const group = groups[e.on]
const access = auth ? (auth[1] ? policy(auth[1]) : 'public') : group?.access ?? fallback`},"bilingual/head":{file:"src/projects/i18n.ts",start:1,end:4,code:`// The Projects tab is bilingual from the start: every interface string exists in
// both languages, and TypeScript refuses a key that one of them lacks.
export type DocLang = 'fa' | 'en'
export const DOC_LANGS: DocLang[] = ['fa', 'en']`},"bilingual/same":{file:"scripts/check-projects.mjs",start:107,end:112,code:"if (fa.map((s) => s.id).join() !== en.map((s) => s.id).join()) at(`${where}: fa and en sections differ`)\nconst used = new Set()\nen.forEach((s, i) => {\n  const other = fa[i]\n  if (JSON.stringify(s.examples ?? []) !== JSON.stringify(other?.examples ?? [])) at(`${where}/${s.id}: fa and en show different examples`)\n  if (JSON.stringify(s.data ?? null) !== JSON.stringify(other?.data ?? null)) at(`${where}/${s.id}: fa and en show different data`)"},"bilingual/inline":{file:"src/projects/i18n.ts",start:226,end:229,code:"export function inline(text: string): string {\n  const escaped = text.replace(/[&<>\"']/g, (c) => `&#${c.charCodeAt(0)};`)\n  return escaped.replace(/`([^`]+)`/g, '<code dir=\"ltr\">$1</code>').replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')\n}"},"docs/pages":{file:"src/projects/model.ts",start:258,end:271,code:`export const PAGES: Page[] = [
  { id: 'overview', group: 'overview' },
  ...(['server', 'pc', 'external', 'infra'] as PageGroup[]).flatMap((g) =>
    MAP.projects
      .filter((p) => groupOf(p) === g)
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
      // A project's own page first, then its topics in the order they are written.
      .flatMap((p) => [
        { id: p.id, group: g, project: p },
        ...(INDEX[p.id]?.pages ?? []).map((topic) => ({ id: \`\${p.id}/\${topic.id}\`, group: g, project: p, topic })),
      ]),
  ),
  { id: 'styling', group: 'about' },
]`},"docs/fold":{file:"src/views/projects/ProjectsView.vue",start:43,end:50,code:`// Clicking the open project again folds its topics away, and the next click opens them;
// going to another project opens that one.
const collapsed = ref<string | null>(null)
watch(() => current.value.project?.id, (id) => id !== collapsed.value && (collapsed.value = null))
const isOpen = (id: string) => id === current.value.project?.id && id !== collapsed.value
const toggle = (id: string) => {
  if (id === current.value.project?.id) collapsed.value = collapsed.value === id ? null : id
}`},"docs/layout":{file:"src/projects/layout.ts",start:33,end:45,code:`// Longest path from the sources, skipping edges that would close a cycle.
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
ids.forEach(depth)`},"docs/edge":{file:"src/projects/layout.ts",start:72,end:84,code:"export function edgePath(a: LayoutNode, b: LayoutNode, box: Layout['box']): string {\n  const y1 = a.y + box.h / 2\n  const y2 = b.y + box.h / 2\n  if (b.column > a.column) {\n    const x1 = a.x + box.w\n    const x2 = b.x\n    const mid = (x1 + x2) / 2\n    return `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`\n  }\n  const x = Math.max(a.x, b.x) + box.w\n  const bend = x + 40\n  return `M${a.x + box.w},${y1} C${bend},${y1} ${bend},${y2} ${b.x + box.w},${y2}`\n}"},"contrast/pairs":{file:"src/styles/base/_theme.scss",start:14,end:19,code:`// Every pair in tokens.$contrast-pairs, in every theme. A failure stops the build.
@each $theme-name, $theme in $themes {
  @each $fg, $bg, $min in $contrast-pairs {
    $ratio: require-contrast(map.get($theme, $fg), map.get($theme, $bg), $min, '#{$theme-name} theme: #{$fg} on #{$bg}');
  }
}`},"contrast/require":{file:"src/styles/abstracts/_functions.scss",start:34,end:43,code:`// Stops the build when two colours that carry text are too close.
@function require-contrast($fg, $bg, $min, $what) {
  $ratio: contrast($fg, $bg);

  @if $ratio < $min {
    @error '#{$what}: contrast #{math.div(math.round($ratio * 100), 100)} is below #{$min}.';
  }

  @return $ratio;
}`},"contrast/list":{file:"src/styles/abstracts/_tokens.scss",start:59,end:75,code:`$contrast-pairs: (
  (ink, bg, 4.5),
  (ink, card, 4.5),
  (muted, bg, 4.5),
  (muted, card, 4.5),
  (accent, card, 4.5),
  (accent, accent-soft, 4.5),
  (accent-ink, accent, 4.5),
  (warn, warn-soft, 4.5),
  (info, info-soft, 4.5),
  (code-ink, code-bg, 4.5),
  (hl-keyword, code-bg, 4.5),
  (hl-string, code-bg, 4.5),
  (hl-comment, code-bg, 4.5),
  (hl-title, code-bg, 4.5),
  (hl-type, code-bg, 4.5),
);`},"ci/deploy":{file:".github/workflows/deploy-pages.yml",start:118,end:134,code:`needs: [python, typescript, csharp, java, frontend, docker, ops]
# Pinned: Playwright's --with-deps needs an Ubuntu release it knows.
runs-on: ubuntu-24.04
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with: { node-version: 22, cache: npm }
  - run: npm ci
  - run: npm run check
  - run: npm run lint:css
  - run: npx vue-tsc -b && npx vite build --base=/\${{ github.event.repository.name }}/
  - name: Print the booklets to PDF
    run: |
      npx playwright install --with-deps chromium
      npx vite preview --base=/\${{ github.event.repository.name }}/ --port 4173 --strictPort &
      for i in $(seq 1 30); do curl -fs http://localhost:4173/\${{ github.event.repository.name }}/ > /dev/null && break; sleep 1; done
      SITE_URL=http://localhost:4173/\${{ github.event.repository.name }}/ npm run pdf`},"ci/publish":{file:".github/workflows/deploy-pages.yml",start:135,end:141,code:`- run: touch dist/.nojekyll
- uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: \${{ secrets.GITHUB_TOKEN }}
    publish_dir: dist
    publish_branch: gh-pages
    force_orphan: true`},"ci/concurrency":{file:".github/workflows/deploy-pages.yml",start:15,end:17,code:`concurrency:
  group: pages
  cancel-in-progress: true`},"vps/pdfbase":{file:"src/lib/booklets.ts",start:9,end:11,code:"// Where the booklet PDFs live. CI prints them next to the site (GitHub Pages); a build\n// elsewhere (the VPS) has no PDFs of its own and points at those with VITE_PDF_BASE.\nexport const PDF_BASE: string = import.meta.env.VITE_PDF_BASE || `${import.meta.env.BASE_URL}pdf/`"},"vps/hash":{file:"src/router/index.ts",start:8,end:10,code:`// Hash history keeps deep links working on GitHub Pages with no rewrite rules.
const router = createRouter({
  history: createWebHashHistory(),`}},o=[],r=[],a=[{path:"/",component:"LessonListView",guards:[]},{path:"/lesson/:id",component:"LessonView",guards:[]},{path:"/booklet/:tag",component:"BookletView",guards:[]},{path:"/review",component:"ReviewView",guards:[]},{path:"/projects",redirect:"/projects/${savedLang()}",guards:[]},{path:"/projects/:lang(fa|en)/:page?/:topic?",component:"ProjectsView",guards:[]}],i={project:e,repo:n,files:t,examples:s,endpoints:o,tables:r,routes:a};export{i as default,o as endpoints,s as examples,t as files,e as project,n as repo,a as routes,r as tables};
