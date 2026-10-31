const e="ledgerdashboard",t="LedgerDashboard",n={"README.md":160,"server/index.js":33,"server/src/config.js":127,Dockerfile:62,"server/.env.example":43,"server/test/api.test.js":1034,"server/test/fixture.js":135,".github/workflows/ci.yml":72,".github/workflows/release.yml":30,"server/test/sqlTestDb.js":49,"server/src/security.js":73,"server/src/app.js":1574,"server/src/paths.js":31,"server/src/csv.js":63,"server/src/process.js":63,"client/src/pages/ApplicationsList.jsx":625,"client/src/pages/ApplicationDetail.jsx":1015,"server/src/pipeline.js":109,"server/src/stores/csvStore.js":154,"server/src/stores/sqlStore.js":351,"client/src/pages/PipelineBoard.jsx":537,"server/src/contact.js":64,"db/03-schema.sql":143,"client/src/components/ContactEditor.jsx":76,"client/src/contact.js":53,"server/src/funnel.js":230,"server/src/rejections.js":215,"server/src/recruiterNext.js":81,"server/src/evaluation.js":94,"client/src/pages/NewPackage.jsx":279,"server/src/combinePackage.js":66,"server/scripts/combine_docx.py":87,"server/src/assistant.js":166,"client/src/components/AssistantPanel.jsx":215,"server/src/aiUsage.js":113,"client/src/pages/CostsPage.jsx":153,"client/src/api.js":295,"server/src/truthBank.js":342,"server/src/truthRoutes.js":412,"server/src/engineGit.js":74,"client/src/pages/TruthBankPage.jsx":446,"server/src/health.js":273,"client/src/pages/HealthPage.jsx":187,"client/src/pages/GapsPage.jsx":309,"client/src/App.jsx":63,"client/src/components/LoginGate.jsx":56,"client/vite.config.js":7,"server/src/stores/index.js":13,"server/src/stores/shape.js":37,"db/01-database.sql":4,"db/02-service-login.sql":20,"server/src/stores/migrate.js":224,"db/04-views.sql":81,"db/05-reader-login.sql":23,"db/06-report-views.sql":187,"reports/LedgerDashboard.pbip":13},s={"run/host":{file:"server/src/config.js",start:23,end:29,code:`const host = env.HOST || (password ? "0.0.0.0" : "127.0.0.1");
if (!password && !LOOPBACK_HOSTS.has(host)) {
  throw new Error(
    \`Refusing to listen on HOST=\${host} without DASHBOARD_PASSWORD — \` +
      "with no password the API is unauthenticated, so it only binds to 127.0.0.1."
  );
}`},"run/start":{file:"server/index.js",start:9,end:17,code:`let cfg;
let store;
try {
  cfg = loadConfig();
  store = await openStore(cfg);
} catch (err) {
  console.error(\`\\n  Ledger Dashboard did not start: \${err.message}\\n\`);
  process.exit(1);
}`},"run/image":{file:"Dockerfile",start:46,end:56,code:`ENV NODE_ENV=production \\
    HOST=0.0.0.0 \\
    JOBSEARCH_DATA_DIR=/data/JobSearch \\
    PYTHON=python3 \\
    GIT_CONFIG_COUNT=1 \\
    GIT_CONFIG_KEY_0=safe.directory \\
    GIT_CONFIG_VALUE_0=* \\
    GIT_AUTHOR_NAME="Ledger Dashboard" \\
    GIT_AUTHOR_EMAIL=dashboard@ledger.local \\
    GIT_COMMITTER_NAME="Ledger Dashboard" \\
    GIT_COMMITTER_EMAIL=dashboard@ledger.local`},"tests/origin":{file:"server/test/api.test.js",start:143,end:149,code:`it("refuses a read from a foreign website", async () => {
  const res = await server.call("GET", "/api/applications", {
    headers: { Origin: "https://evil.example" },
  });
  expect(res.status).toBe(403);
  expect(res.headers.get("access-control-allow-origin")).toBeNull();
});`},"tests/ci":{file:".github/workflows/ci.yml",start:14,end:28,code:`services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    env:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: Ci-only_Throwaway1!
    ports:
      - 1433:1433
    options: >-
      --health-cmd "/opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'Ci-only_Throwaway1!' -Q 'SELECT 1' -b -o /dev/null"
      --health-interval 5s --health-timeout 5s --health-retries 30 --health-start-period 20s
env:
  TEST_SQL_SERVER: localhost
  TEST_SQL_USER: sa
  TEST_SQL_PASSWORD: Ci-only_Throwaway1!`},"tests/release":{file:".github/workflows/release.yml",start:25,end:30,code:`- name: Package
  run: tar -czf ledger-dashboard-client-\${GITHUB_REF_NAME}.tar.gz -C client dist
- name: Publish release
  env:
    GH_TOKEN: \${{ github.token }}
  run: gh release create "$GITHUB_REF_NAME" ledger-dashboard-client-*.tar.gz --title "$GITHUB_REF_NAME" --generate-notes`},"tests/fake":{file:"server/test/fixture.js",start:124,end:136,code:`export function fakeAnthropic(inputFor) {
  const calls = [];
  return {
    calls,
    messages: {
      create: async (req) => {
        calls.push(req);
        return { content: [{ type: "tool_use", input: await inputFor(req) }] };
      },
    },
  };
}
`},"tests/kinds":{file:"server/test/api.test.js",start:11,end:14,code:`// The whole API suite runs once per store: the CSV files, and (when a SQL
// Server is configured) a throwaway SQL database seeded from the same
// fixture through the real migration. Same requests, same expectations.
const KINDS = sqlAvailable ? ["csv", "sql"] : ["csv"];`},"login/secret":{file:"server/src/config.js",start:37,end:46,code:`  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      \`SESSION_SECRET must be set to a random value of at least \${MIN_SESSION_SECRET_LENGTH} \` +
        "characters whenever DASHBOARD_PASSWORD is set."
    );
  }
  if (sessionSecret === password) {
    throw new Error("SESSION_SECRET must be different from DASHBOARD_PASSWORD.");
  }
}`},"login/cookie":{file:"server/src/app.js",start:98,end:105,code:`cookieSession({
  name: "ld_session",
  keys: [cfg.sessionSecret],
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: "lax",
  httpOnly: true,
  secure: cfg.secureCookies ?? cfg.production,
})`},"login/compare":{file:"server/src/security.js",start:6,end:10,code:`export function passwordMatches(candidate, expected) {
  const a = createHash("sha256").update(String(candidate ?? "")).digest();
  const b = createHash("sha256").update(String(expected ?? "")).digest();
  return timingSafeEqual(a, b);
}`},"login/login":{file:"server/src/app.js",start:110,end:127,code:`app.post("/api/login", (req, res) => {
  const ip = req.ip;
  const wait = limiter.retryAfterSeconds(ip);
  if (wait > 0) {
    res.set("Retry-After", String(wait));
    return res
      .status(429)
      .json({ error: \`Too many wrong passwords — try again in \${Math.ceil(wait / 60)} min.\` });
  }
  const { password } = req.body || {};
  if (!passwordMatches(password, cfg.password)) {
    limiter.recordFailure(ip);
    return res.status(401).json({ error: "Wrong password" });
  }
  limiter.recordSuccess(ip);
  req.session.authed = true;
  res.json({ authed: true });
});`},"login/token":{file:"server/src/app.js",start:136,end:140,code:`const hasApiToken = (req) => {
  if (!cfg.apiToken) return false;
  const m = /^Bearer (.+)$/.exec(req.get("authorization") || "");
  return !!m && passwordMatches(m[1], cfg.apiToken);
};`},"login/gate":{file:"server/src/app.js",start:146,end:150,code:`app.use("/api", (req, res, next) => {
  if (req.path === "/login" || req.path === "/session") return next();
  if (req.session?.authed || hasApiToken(req)) return next();
  res.status(401).json({ error: "Login required" });
});`},"origin/guard":{file:"server/src/security.js",start:52,end:72,code:`export function originGuard(allowedOrigins) {
  const allowed = new Set(allowedOrigins);
  return (req, res, next) => {
    const origin = req.get("origin");
    if (!origin) return next(); // non-browser client, or a same-origin GET
    const self = \`\${req.protocol}://\${req.get("host")}\`;
    if (origin === self) return next();
    if (!allowed.has(origin)) {
      return res.status(403).json({ error: "Cross-origin request refused" });
    }

    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.sendStatus(204);
    }
    next();
  };`},"origin/dev":{file:"server/src/config.js",start:13,end:13,code:'const DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];'},"origin/allowed":{file:"server/src/config.js",start:99,end:99,code:"allowedOrigins: [...(production ? [] : DEV_ORIGINS), ...extraOrigins],"},"origin/extra":{file:"server/src/config.js",start:86,end:89,code:`const extraOrigins = (env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);`},"origin/preflight":{file:"server/test/api.test.js",start:151,end:156,code:`it("refuses a delete preflight from a foreign website", async () => {
  const res = await server.call("OPTIONS", \`/api/applications/\${FOLDER_A}\`, {
    headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "DELETE" },
  });
  expect(res.status).toBe(403);
});`},"safety/name":{file:"server/src/paths.js",start:6,end:10,code:`const FOLDER_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isSafeFolderName(name) {
  return typeof name === "string" && FOLDER_NAME_RE.test(name) && !name.includes("..");
}`},"safety/resolve":{file:"server/src/paths.js",start:16,end:24,code:`export function resolveApplicationFolder(applicationsDir, name) {
  if (!isSafeFolderName(name)) {
    throw new UnsafeFolderError(name);
  }
  const root = path.resolve(applicationsDir);
  const resolved = path.resolve(root, name);
  if (path.dirname(resolved) !== root) throw new UnsafeFolderError(name);
  return resolved;
}`},"safety/atomic":{file:"server/src/csv.js",start:44,end:54,code:`export function writeFileAtomic(file, content) {
  const tmp = \`\${file}.\${process.pid}.\${Date.now()}.tmp\`;
  writeFileSync(tmp, content, "utf-8");
  try {
    renameSync(tmp, file);
  } catch (err) {
    rmSync(tmp, { force: true });
    if (LOCK_CODES.has(err.code)) throw new FileLockedError(file);
    throw err;
  }
}`},"safety/locked":{file:"server/src/csv.js",start:31,end:37,code:`export class FileLockedError extends Error {
  constructor(file) {
    super(\`\${file} is open in another program (close it in Excel and try again).\`);
    this.name = "FileLockedError";
    this.file = file;
  }
}`},"safety/timer":{file:"server/src/process.js",start:25,end:28,code:`const timer = setTimeout(() => {
  timedOut = true;
  killTree(child.pid, isWindows);
}, timeoutMs);`},"safety/kill":{file:"server/src/process.js",start:41,end:51,code:`function killTree(pid, isWindows) {
  if (!pid) return;
  try {
    // Not spawnSync: taskkill can take seconds, and every other request would
    // wait on it. The child's own "close" event still ends runProcess.
    if (isWindows) spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true }).on("error", () => {});
    else process.kill(-pid, "SIGKILL");
  } catch {
    // already gone
  }
}`},"safety/errors":{file:"server/src/app.js",start:66,end:87,code:`function sendError(res, err) {
  if (err instanceof FileLockedError) return res.status(423).json({ error: err.message });
  if (err instanceof UnsafeFolderError) return res.status(400).json({ error: err.message });
  if (err instanceof ContactValidationError) return res.status(400).json({ error: err.message });
  // A value the database refused (bad date, too long, duplicate, constraint).
  if (isStoreValidationError(err)) return res.status(400).json({ error: \`Invalid value: \${err.message}\` });
  // Claude's own errors say what to fix (a revoked key, no credit) and hold
  // no server paths, so they're shown even in production.
  if (err instanceof Anthropic.RateLimitError) {
    return res.status(429).json({ error: "Claude is busy right now (rate limit). Try again in a minute." });
  }
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("[claude]", err.status, err.message);
    return res.status(502).json({ error: "Claude rejected the API key (401) — put a valid ANTHROPIC_API_KEY in server/.env and restart." });
  }
  if (err instanceof Anthropic.APIError) {
    console.error("[claude]", err.status, err.message);
    return res.status(502).json({ error: \`Claude API error\${err.status ? \` (\${err.status})\` : ""}: \${err.message}\` });
  }
  console.error(err);
  res.status(500).json({ error: cfg.production ? "Internal server error" : err.message });
}`},"applications/folder":{file:"server/src/app.js",start:287,end:293,code:'const base = `${date}__${slugify(company) || "Company"}__${slugify(role) || "Role"}`;\nconst existingFolders = new Set(rows.map((r) => r.folder));\nlet folder = base;\nlet n = 2;\nwhile (existingFolders.has(folder) || existsSync(path.join(APPLICATIONS_DIR, folder))) {\n  folder = `${base}-${n++}`;\n}'},"applications/editable":{file:"server/src/app.js",start:370,end:372,code:`const EDITABLE_LEDGER_FIELDS = new Set([
  "notes", "next_action", "last_contact", "outcome", "gap_tags", ...CONTACT_FIELDS,
]);`},"applications/delete":{file:"server/src/app.js",start:414,end:431,code:`app.delete("/api/applications/:id", async (req, res) => {
  try {
    const folder = req.params.id;
    const row = await findLedgerRow(folder);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (buildsInFlight.has(folder)) {
      return res.status(409).json({ error: "A build is running for this application" });
    }

    const folderPath = resolveApplicationFolder(APPLICATIONS_DIR, row.folder);
    await store.deleteApplication(folder);
    if (existsSync(folderPath)) rmSync(folderPath, { recursive: true, force: true });

    res.json({ deleted: true, folder });
  } catch (err) {
    sendError(res, err);
  }
});`},"applications/download":{file:"server/src/app.js",start:599,end:601,code:`const listed = existsSync(folderPath) ? readdirSync(folderPath) : [];
if (!listed.includes(name)) return res.status(404).json({ error: "No such file" });
res.download(path.join(folderPath, name), name);`},"applications/unique":{file:"server/src/app.js",start:288,end:293,code:`const existingFolders = new Set(rows.map((r) => r.folder));
let folder = base;
let n = 2;
while (existingFolders.has(folder) || existsSync(path.join(APPLICATIONS_DIR, folder))) {
  folder = \`\${base}-\${n++}\`;
}`},"applications/estimate":{file:"server/src/app.js",start:348,end:360,code:`if (variant && postingText) {
  const score = Math.round(Number(match_score));
  saveAnalysis(folder, {
    source: "nightly-estimate",
    match_score: Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : null,
    base_variant: variant,
    recommendation: null,
    reasoning: reasoning || "",
    gaps: Array.isArray(gaps) ? gaps.map(String) : [],
    gap_tags: tags,
    ...(droppedClosedGaps.length ? { dropped_closed_gaps: droppedClosedGaps } : {}),
  });
}`},"pipeline/append":{file:"server/src/stores/csvStore.js",start:38,end:44,code:`function appendEventLine({ folder, company, stage, date, note }) {
  const raw = existsSync(PIPELINE_PATH) ? readFileSync(PIPELINE_PATH, "utf-8") : "";
  const needsNewline = raw.length > 0 && !raw.endsWith("\\n");
  const eventDate = date && ISO_DATE_RE.test(date) ? date : todayISO();
  const line = [folder, company, stage, eventDate, note || ""].map(csvField).join(",");
  appendLine(PIPELINE_PATH, (needsNewline ? "\\n" : "") + line + "\\n");
}`},"pipeline/current":{file:"server/src/pipeline.js",start:48,end:50,code:`const stageEvents = history.filter((h) => h.stage !== FOLLOWUP_KEY);
const last = stageEvents.length ? stageEvents[stageEvents.length - 1] : null;
const stage = last ? last.stage : r.status || "draft";`},"pipeline/since":{file:"server/src/pipeline.js",start:66,end:75,code:`const lastActionDate =
  lastFollowupDate && (!last || lastFollowupDate >= last.date)
    ? lastFollowupDate
    : last?.date || null;
const { days: daysSinceAction } = daysSince(lastActionDate);

const needsFollowup =
  waitingKeys.has(stage) &&
  daysSinceAction !== null &&
  daysSinceAction > FOLLOWUP_THRESHOLD_DAYS;`},"pipeline/local":{file:"server/src/pipeline.js",start:99,end:105,code:`export function parseLocalDate(value) {
  const m = /^(\\d{4})-(\\d{2})-(\\d{2})(?:T(\\d{2}):(\\d{2})(?::(\\d{2}))?)?$/.exec(String(value || ""));
  if (!m) return null;
  const [, y, mo, d, h = 0, mi = 0, s = 0] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  return isNaN(date) ? null : date;
}`},"pipeline/undo":{file:"server/src/stores/sqlStore.js",start:269,end:283,code:`async removeEvents(folder, { all = false } = {}) {
  const { recordset } = await pool.request()
    .input("folder", sql.NVarChar(150), folder)
    .input("all", sql.Bit, all ? 1 : 0)
    .query(\`
      DELETE e
      OUTPUT DELETED.StageKey AS stage, CONVERT(varchar(10), DELETED.EventDate, 23) AS [date],
             DELETED.Note AS note
      FROM dbo.PipelineEvents e
      JOIN dbo.Applications a ON a.Id = e.ApplicationId
      WHERE a.Folder = @folder
        AND e.Id > (SELECT MIN(Id) FROM dbo.PipelineEvents WHERE ApplicationId = a.Id)
        AND (@all = 1 OR e.Id = (SELECT MAX(Id) FROM dbo.PipelineEvents WHERE ApplicationId = a.Id))\`);
  return recordset;
},`},"contact/sources":{file:"server/src/contact.js",start:13,end:18,code:`export const CONTACT_SOURCES = {
  posting: { label: "Listed in the posting", published: true },
  ats_email: { label: "Reply-to of the ATS confirmation", published: true },
  recruiter_reply: { label: "They emailed me", published: true },
  found: { label: "Found it myself (company site, hiring team)", published: false },
};`},"contact/resolve":{file:"server/src/contact.js",start:51,end:57,code:`const verified = CONTACT_SOURCES[source].published || isTrue(merged.contact_verified);
if (!verified) {
  throw new ContactValidationError(
    "Only published or verified addresses are saved. Check this one exists first — a guessed address usually bounces."
  );
}
return { contact_name: name, contact_email: email, contact_source: source, contact_verified: "true" };`},"contact/patch":{file:"server/src/app.js",start:388,end:390,code:`if (CONTACT_FIELDS.some((f) => f in updates)) {
  Object.assign(updates, resolveContact(current, updates));
}`},"contact/check":{file:"db/03-schema.sql",start:75,end:79,code:`ALTER TABLE dbo.Applications ADD CONSTRAINT CK_Applications_Contact CHECK (
    (ContactEmail = N'' AND ContactSource = N'')
    OR (ContactEmail LIKE N'_%@_%._%'
        AND ContactSource IN (N'posting', N'ats_email', N'recruiter_reply', N'found')
        AND ContactVerified = 1));`},"contact/mailto":{file:"client/src/contact.js",start:29,end:44,code:'export function followupMailto(app) {\n  const firstName = (app.contact_name || "").trim().split(/\\s+/)[0];\n  const when = appliedOn(app);\n  const subject = `Following up on my application: ${app.role}`;\n  const body = [\n    `Hi ${firstName || "there"},`,\n    "",\n    `I applied for the ${app.role} position at ${app.company}${when ? ` on ${when}` : ""} and wanted to follow up briefly. ` +\n      "I\'m still very interested in the role and would welcome the chance to talk about how my experience fits.",\n    "",\n    "Happy to share anything else that would help.",\n    "",\n    "Thank you for your time,",\n    SIGNATURE,\n  ].join("\\r\\n");\n  return `mailto:${encodeURIComponent(app.contact_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;'},"boards/prior":{file:"server/src/funnel.js",start:15,end:20,code:`// Benchmarks before any of the user's own data (newcomer, cold applications):
// ~3% of applications reach a recruiter screen, ~15% of screens end in an
// offer. Beta(1.5, 48.5) and Beta(3, 17) are those means with a weak weight,
// so a few weeks of real results move them quickly.
const SCREEN_PRIOR = [1.5, 48.5];
const OFFER_PRIOR = [3, 17];`},"boards/caps":{file:"server/src/recruiterNext.js",start:5,end:13,code:`// LinkedIn (free) allows only a few personalised invites a month but ~100
// plain invites a week, so connects go out WITHOUT a note and the real
// message waits until they accept (1st-degree messages are unlimited).
export const CONNECT_DAILY_CAP = 12;
export const CONNECT_WEEKLY_CAP = 60;
export const FIRST_MESSAGE_AFTER_DAYS = 1;  // after the connect is accepted
export const FOLLOWUP_AFTER_DAYS = 7;       // no reply to the message
export const STALE_CONNECT_DAYS = 14;       // connect never accepted
export const CHECKIN_AFTER_DAYS = 28;       // monthly check-in once they replied`},"boards/confusion":{file:"server/src/evaluation.js",start:16,end:37,code:`export function confusion(items, threshold) {
  const m = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const it of items) {
    const predicted = it.score >= threshold;
    const actual = it.label === "apply";
    if (predicted && actual) m.tp++;
    else if (predicted) m.fp++;
    else if (actual) m.fn++;
    else m.tn++;
  }
  const n = m.tp + m.fp + m.fn + m.tn;
  return {
    threshold,
    n,
    ...m,
    accuracy: pct(m.tp + m.tn, n),
    // Of the postings the model said to apply to, how many were worth it.
    precision: pct(m.tp, m.tp + m.fp),
    // Of the postings worth applying to, how many the model caught.
    recall: pct(m.tp, m.tp + m.fn),
  };
}`},"boards/horizon":{file:"server/src/funnel.js",start:10,end:13,code:`// Hiring takes ~4-6 weeks, so only applications sent in the first 20 weeks
// of a 26-week horizon can still turn into a job inside it.
const HORIZON_WEEKS = 26;
const USEFUL_WEEKS = 20;`},"boards/rejectWord":{file:"server/src/rejections.js",start:12,end:15,code:`// "برای فردا" sections list postings that passed and are waiting, even when
// the heading also mentions a rejection, so they are never read as rejects.
// "رد" must be a whole word: it is also inside "فردا" (tomorrow), "کرد" etc.
const REJECT_WORD_RE = /(^|[\\s(])رد($|[\\s‌)])/;`},"analyze/strict":{file:"server/src/app.js",start:701,end:709,code:`// strict: the API then guarantees the input matches this schema. Without it
// the model sometimes dropped gap_tags, or put the gap_tags array inside
// the \`gaps\` string, so the row was saved with no tags. Strict mode doesn't
// allow minimum/maximum, so normalizeAnalysis clamps match_score instead.
const ANALYZE_TOOL = {
  name: "submit_analysis",
  description: "Submit the match analysis for this job posting against the candidate's fact bank.",
  strict: true,
  input_schema: {`},"analyze/normalize":{file:"server/src/app.js",start:771,end:781,code:`if (message.stop_reason === "max_tokens") {
  throw new Error("Analysis was cut off (max_tokens) — nothing was saved, try again");
}
const toolUse = message.content.find((b) => b.type === "tool_use");
if (!toolUse) throw new Error("Model did not return a structured analysis");
const a = toolUse.input;
const gaps = Array.isArray(a.gaps) ? a.gaps : [];
const allTags = toGapTagList(a.gap_tags);
if (gaps.length > 0 && allTags.length === 0) {
  throw new Error("Analysis listed gaps but no gap_tags — nothing was saved, try again");
}`},"analyze/closed":{file:"server/src/app.js",start:760,end:765,code:`function withoutClosedGaps(rawTags) {
  const tags = resolveGapAliases(rawTags, readGapAliases(GAP_ALIASES_PATH));
  const dict = loadGapTagsDict();
  const isClosed = (t) => dict[t] != null && gapStatus(String(dict[t])) === "closed";
  return { kept: tags.filter((t) => !isClosed(t)), dropped: tags.filter(isClosed) };
}`},"analyze/cached":{file:"server/src/app.js",start:834,end:838,code:`function cachedSystem(text, tail = "") {
  const blocks = [{ type: "text", text, cache_control: { type: "ephemeral" } }];
  if (tail) blocks.push({ type: "text", text: tail });
  return blocks;
}`},"analyze/draftOnly":{file:"server/src/app.js",start:1012,end:1014,code:`if (row.stage !== "draft") {
  return res.status(409).json({ error: "Only drafts can be re-analyzed — this one was already sent" });
}`},"build/enum":{file:"server/src/app.js",start:1051,end:1061,code:`bullets: {
  type: "array",
  items: {
    type: "object",
    properties: {
      fact_id: { type: "string", enum: selectableFactIds(facts, variant) },
      text: { type: "string" },
    },
    required: ["fact_id", "text"],
  },
  minItems: 8,`},"build/roles":{file:"server/src/app.js",start:1215,end:1224,code:`validation = missingRoles.length
  ? {
      status: 1,
      stdout:
        \`ERROR: employment role(s) missing from the résumé: \${missingRoles.join(", ")} — \` +
        "every role needs at least one bullet, or the timeline shows a gap\\n",
    }
  : await runProcess(python, [path.join(ENGINE_DIR, "validate.py"), planPath], {
      timeoutMs: cfg.validateTimeoutMs ?? VALIDATE_TIMEOUT_MS,
    });`},"build/repair":{file:"server/src/app.js",start:1190,end:1196,code:`for (let attempt = 0; attempt < 2; attempt++) {
  const message = await client.messages.create(request);
  logUsage("build", message);
  recordUsage(folderPath, usageRecord(attempt ? "build-repair" : "build", message, request.model));
  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse) throw new Error("Model did not return a structured package");
  generated = toolUse.input;`},"build/warnings":{file:"server/src/app.js",start:1269,end:1275,code:`let guardianWarnings = [];
if (validation.status !== 0) {
  guardianWarnings = (validation.stdout || validation.stderr || "").split("\\n").filter(Boolean);
  saveBuildError("guardian-warning", guardianWarnings);
} else if (existsSync(buildErrorPath)) {
  unlinkSync(buildErrorPath);
}`},"build/inflight":{file:"server/src/app.js",start:1374,end:1390,code:`app.post("/api/packages/build", async (req, res) => {
  const { folder } = req.body || {};
  if (!isSafeFolderName(folder) || !(await findLedgerRow(folder))) {
    return res.status(404).json({
      error: \`Unknown folder: \${folder} — call /api/packages/analyze first, it creates this\`,
    });
  }
  if (buildsInFlight.has(folder)) {
    return res.status(409).json({ error: "This application is already being built" });
  }
  buildsInFlight.add(folder);
  try {
    await buildPackage(req, res);
  } finally {
    buildsInFlight.delete(folder);
  }
});`},"assistant/snapshot":{file:"server/src/assistant.js",start:64,end:89,code:`export function ledgerSnapshot(rows, now = new Date()) {
  const apps = rows.map((r) => {
    return {
      folder: r.folder,
      date: r.date,
      company: r.company,
      role: r.role,
      location: r.location || undefined,
      source: r.source || undefined,
      track: r.track,
      match: r.match_score === "" || r.match_score == null ? undefined : Number(r.match_score),
      stage: r.stage,
      days_in_stage: r.daysInStage ?? undefined,
      days_until_stage: r.daysUntilStage ?? undefined,
      days_since_action: r.daysSinceAction ?? undefined,
      followup_due: r.needsFollowup || undefined,
      followups: r.followupCount || undefined,
      next_action: r.next_action || undefined,
      outcome: r.outcome || undefined,
      gaps: r.gap_tags || undefined,
      notes: r.notes ? String(r.notes).slice(0, NOTES_MAX) : undefined,
    };
  });
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return { today: local.toISOString().slice(0, 10), applications: apps };
}`},"assistant/schema":{file:"server/src/assistant.js",start:33,end:36,code:`folder: {
  type: ["string", "null"],
  description: "The application's folder exactly as in the snapshot, or null when the step is not about one application.",
},`},"assistant/call":{file:"server/src/assistant.js",start:120,end:134,code:`const message = await client.beta.messages.create({
  model: ASSISTANT_MODEL,
  max_tokens: 16000,
  // On a safety decline, the API retries on a fallback model it picks.
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
  output_config: { effort: "medium", format: { type: "json_schema", schema: ANSWER_SCHEMA } },
  system: [
    { type: "text", text: SYSTEM_PROMPT },
    // The snapshot changes only when the ledger does, so follow-up
    // questions read it from the cache.
    { type: "text", text: "LEDGER SNAPSHOT:\\n" + JSON.stringify(snapshot), cache_control: { type: "ephemeral" } },
  ],
  messages,
});`},"assistant/known":{file:"server/src/assistant.js",start:158,end:164,code:`const known = new Set(snapshot.applications.map((a) => a.folder));
const actions = (Array.isArray(parsed.actions) ? parsed.actions : []).map((a) => ({
  title: String(a.title || ""),
  why: String(a.why || ""),
  priority: ["high", "medium", "low"].includes(a.priority) ? a.priority : "medium",
  folder: a.folder && known.has(a.folder) ? a.folder : null,
}));`},"assistant/request":{file:"server/src/assistant.js",start:91,end:102,code:`export function validateAssistantRequest(body) {
  const mode = body?.mode === "brief" ? "brief" : body?.mode === "ask" ? "ask" : null;
  if (!mode) return { error: 'mode must be "brief" or "ask"' };
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (mode === "ask" && !question) return { error: "question is required" };
  if (question.length > QUESTION_MAX) return { error: \`question is longer than \${QUESTION_MAX} characters\` };
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => t && typeof t.question === "string" && typeof t.answer === "string")
    .slice(-HISTORY_MAX)
    .map((t) => ({ question: t.question.slice(0, QUESTION_MAX), answer: t.answer.slice(0, 4000) }));
  return { mode, question, history };
}`},"costs/prices":{file:"server/src/aiUsage.js",start:13,end:18,code:`const PRICES = {
  "claude-sonnet-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
};`},"costs/before":{file:"server/src/app.js",start:887,end:889,code:`// Filed before normalizeAnalysis, which can still throw: a failed call
// was paid for all the same.
if (folder) recordUsage(resolveApplicationFolder(APPLICATIONS_DIR, folder), usage);`},"costs/cost":{file:"server/src/aiUsage.js",start:20,end:30,code:`export function costOf(model, usage) {
  const p = PRICES[model] || PRICES["claude-sonnet-5"];
  const u = usage || {};
  const usd =
    ((u.input_tokens || 0) * p.input +
      (u.cache_read_input_tokens || 0) * p.cacheRead +
      (u.cache_creation_input_tokens || 0) * p.cacheWrite +
      (u.output_tokens || 0) * p.output) /
    1e6;
  return Math.round(usd * 1e6) / 1e6;
}`},"costs/brake":{file:"server/src/app.js",start:898,end:914,code:`const AI_ROUTES = {
  "/api/packages/analyze": "analyze",
  "/api/packages/reanalyze": "analyze",
  "/api/packages/build": "build",
  "/api/assistant": "assistant",
};
app.post(Object.keys(AI_ROUTES), (req, res, next) => {
  if (req.get("x-ai-request") === "app") return next();
  const allowed = cfg.aiScriptCalls === "all" || (cfg.aiScriptCalls === "analyze" && AI_ROUTES[req.path] === "analyze");
  if (allowed) return next();
  res.status(403).json({
    error:
      "Claude calls only start from a button in the dashboard (they spend API credit). " +
      "Save the posting as a draft with POST /api/applications { postingText } and analyze it from its page.",
    code: "ai_manual_only",
  });
});`},"costs/header":{file:"client/src/api.js",start:133,end:133,code:'const AI_HEADERS = { "Content-Type": "application/json", "X-AI-Request": "app" };'},"truth-bank/spans":{file:"server/src/truthBank.js",start:156,end:168,code:`function itemSpans(lines) {
  const spans = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^- id:\\s*(\\S+)\\s*$/.exec(lines[i]);
    if (!m) continue;
    let end = i;
    for (let j = i + 1; j < lines.length && !/^\\S/.test(lines[j]); j++) {
      if (lines[j].trim()) end = j;
    }
    spans.push({ id: m[1], start: i, end });
  }
  return spans;
}`},"truth-bank/rename":{file:"server/src/truthBank.js",start:191,end:193,code:`if (!create && fact.id !== id) {
  throw new TruthBankError("A fact's id can't be renamed — gaps and built résumés refer to it", 400);
}`},"truth-bank/checked":{file:"server/src/truthBank.js",start:214,end:221,code:`writeChecked(filePath, lines.join("\\n"), (parsed) => {
  const back = parsed.find((f) => f?.id === fact.id);
  if (!back || !sameFact(back, fact)) throw new Error(\`Rendered YAML for \${fact.id} didn't read back the same — nothing was written\`);
  const before = loadYaml(src) || [];
  if (parsed.length !== before.length + (create ? 1 : 0)) {
    throw new Error(\`Saving \${fact.id} would have changed other facts in \${file} — nothing was written\`);
  }
}, src);`},"truth-bank/commit":{file:"server/src/engineGit.js",start:16,end:32,code:`async function commit(paths, message) {
  if (!enabled()) return null;
  const add = await git(["add", "--", ...paths]);
  // No git binary (an image built without it): the file is already saved,
  // so the save shouldn't answer 500 — it just goes unrecorded.
  if (add.status === null && /ENOENT/.test(add.stderr)) {
    console.warn(\`[engine-git] git not found — "\${message}" saved without a commit\`);
    return null;
  }
  if (add.status !== 0) throw new Error(\`git add failed: \${add.stderr || add.stdout}\`);
  const staged = await git(["diff", "--cached", "--quiet", "--", ...paths]);
  if (staged.status === 0) return null; // nothing actually changed
  const res = await git(["commit", "-q", "-m", message, "--", ...paths]);
  if (res.status !== 0) throw new Error(\`git commit failed: \${res.stderr || res.stdout}\`);
  const head = await git(["rev-parse", "--short", "HEAD"]);
  return head.stdout.trim();
}`},"health/status":{file:"server/src/truthBank.js",start:55,end:60,code:`export function gapStatus(label) {
  const t = label || "";
  if (t.includes("کامل بسته شد")) return "closed";
  if (t.includes("بسته شد")) return /همچنان|باقی|هنوز/.test(t) ? "partial" : "closed";
  return "open";
}`},"health/why":{file:"server/src/health.js",start:1,end:8,code:`// Consistency checks across the truth bank, the gap dictionary, the résumé
// templates and the drafts built from them. Each rule exists because the
// mismatch it describes actually happened and had to be found by hand:
//   - a fact tagged mongodb whose claim never said "MongoDB" (the build model
//     only reads claim text, so the posting was told there was no MongoDB);
//   - a gap label still saying "all relational" after MongoDB facts landed;
//   - drafts scored before newer evidence was added (gap_tags are a snapshot).
// Pure: everything it needs is passed in, so it's tested without files.`},"health/stem":{file:"server/src/health.js",start:30,end:41,code:`const stemLast = (tag) => tag.replace(/([a-z]{4,}?)(?:ing|es|ed|s)$/, "$1");
const spellings = (tag) =>
  [tag, stemLast(tag)].flatMap((t) => [
    t.replace(/_/g, " "),
    t.replace(/_/g, ""),
    t.replace(/_/g, "-"),
    t.replace(/_/g, "."),
  ]);
export const mentions = (tag, text) => {
  const t = String(text || "").toLowerCase();
  return spellings(tag.toLowerCase()).some((s) => t.includes(s));
};`},"health/fingerprint":{file:"server/src/truthBank.js",start:256,end:263,code:`export function bankFingerprint(factsDir, gapTagsPath) {
  const { facts } = readFacts(factsDir);
  return createHash("sha1")
    .update(JSON.stringify(facts.map(({ index, file, ...f }) => f)))
    .update(JSON.stringify(readGaps(gapTagsPath)))
    .digest("hex")
    .slice(0, 12);
}`},"health/staleFlag":{file:"server/src/truthRoutes.js",start:67,end:69,code:`// Old drafts have no saved fingerprint: if they have a posting at
// all, they were analyzed before tracking began, so treat as stale.
analysisStale: files.includes("posting.txt") && analysis?.bank_fingerprint !== fingerprint,`},"fe-app/gate":{file:"client/src/components/LoginGate.jsx",start:10,end:14,code:`useEffect(() => {
  checkSession()
    .then((s) => setStatus(s.passwordRequired && !s.authed ? "needed" : "ok"))
    .catch(() => setStatus("ok")); // fail open locally rather than lock the user out
}, []);`},"fe-app/base":{file:"client/src/api.js",start:3,end:3,code:'const API_BASE = import.meta.env.DEV ? "http://localhost:4310" : "";'},"fe-app/static":{file:"server/src/app.js",start:1564,end:1571,code:`// Serve the built React app (so no dev server / Vite is needed to use this)
if (existsSync(cfg.clientDist)) {
  app.use(express.static(cfg.clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(cfg.clientDist, "index.html"));
  });
}`},"fe-app/shell":{file:"client/src/App.jsx",start:28,end:36,code:`<LoginGate>
  <HashRouter>
    <div className="app-shell">
      <Navbar />
      <main className="app-scroll-panel" id={SCROLL_PANEL_ID}>
        <div className="container py-4">
          <UpdateBanner />
          <DailyLine />
          <Routes>`},"stores/open":{file:"server/src/stores/index.js",start:7,end:13,code:`export async function openStore(cfg) {
  if (cfg.store === "sql") {
    const pool = await connectSqlPool(cfg.db);
    return createSqlStore(pool);
  }
  return createCsvStore(path.join(cfg.jobsearchDir, "engine"));
}`},"stores/sync":{file:"server/src/stores/csvStore.js",start:12,end:13,code:`// Every read-modify-write here is synchronous inside the method, so two
// requests in this process can't interleave between the read and the write.`},"stores/create":{file:"server/src/stores/sqlStore.js",start:204,end:216,code:`async createApplication(row) {
  await inTransaction(async (request) => {
    const r = request().input("folder", sql.NVarChar(150), row.folder);
    const fields = Object.entries(APPLICATION_COLUMNS);
    fields.forEach(([field, { type }], i) => bindColumn(r, \`p\${i}\`, row[field], type));
    const { recordset } = await r.query(\`
      INSERT INTO dbo.Applications (Folder, \${fields.map(([, c]) => c.column).join(", ")})
      OUTPUT INSERTED.Id
      VALUES (@folder, \${fields.map(([, { type }], i) => valueExpr(\`p\${i}\`, type)).join(", ")})\`);
    const applicationId = recordset[0].Id;
    await replaceGapTags(request, applicationId, row.gap_tags);
    await insertEvent(request, { applicationId, stage: "draft", date: todayISO(), note: "" });
  });`},"stores/select":{file:"server/src/stores/sqlStore.js",start:58,end:70,code:`function selectList(columns, alias) {
  return Object.entries(columns)
    .map(([field, { column, type }]) => {
      const ref = \`\${alias}.\${column}\`;
      // varchar, not char: ISNULL takes the first argument's type, and a
      // char(10) would turn the "" fallback into ten spaces (truthy).
      if (type === "date") return \`ISNULL(CONVERT(varchar(10), \${ref}, 23), '') AS [\${field}]\`;
      if (type === "score") return \`ISNULL(CAST(\${ref} AS nvarchar(3)), '') AS [\${field}]\`;
      if (type === "flag") return \`CASE WHEN \${ref} = 1 THEN 'true' ELSE '' END AS [\${field}]\`;
      return \`\${ref} AS [\${field}]\`;
    })
    .join(",\\n      ");
}`},"stores/errors":{file:"server/src/stores/sqlStore.js",start:108,end:111,code:`const VALIDATION_ERROR_NUMBERS = new Set([220, 241, 242, 245, 547, 2601, 2627, 2628, 8114, 8115, 8152]);
export function isStoreValidationError(err) {
  return !!err && typeof err.number === "number" && VALIDATION_ERROR_NUMBERS.has(err.number);
}`},"stores/columns":{file:"server/src/stores/shape.js",start:3,end:12,code:`// The API's row shapes — the same field names ledger.csv and
// target_list.csv always had. Both stores return exactly these, so the
// client never knows which one is behind the API.
export const LEDGER_COLUMNS = [
  "date", "company", "role", "branch", "source", "source_detail", "poster_type",
  "poster_name", "end_client", "applied_via", "posting_url", "date_posted",
  "date_seen", "location", "match_score", "variant", "folder", "status",
  "last_contact", "next_action", "outcome", "notes", "gap_tags",
  "contact_name", "contact_email", "contact_source", "contact_verified",
];`},"stores/recruiterId":{file:"server/src/stores/shape.js",start:24,end:27,code:'export function recruiterId(r) {\n  const key = r.linkedin_url || `${r.name}|${r.company}`;\n  return createHash("sha1").update(key).digest("hex").slice(0, 12);\n}'},"schema/svc":{file:"db/02-service-login.sql",start:17,end:19,code:`IF USER_ID(N'ledger_svc') IS NULL CREATE USER ledger_svc FOR LOGIN ledger_svc;
ALTER ROLE db_datareader ADD MEMBER ledger_svc;
ALTER ROLE db_datawriter ADD MEMBER ledger_svc;`},"schema/folder":{file:"db/03-schema.sql",start:34,end:37,code:`Folder        NVARCHAR(150) NOT NULL CONSTRAINT UQ_Applications_Folder UNIQUE
              CONSTRAINT CK_Applications_Folder CHECK (
                  Folder <> N'' AND Folder NOT LIKE N'%..%'
                  AND Folder COLLATE Latin1_General_BIN NOT LIKE N'%[^-A-Za-z0-9._]%'),`},"schema/slug":{file:"db/03-schema.sql",start:82,end:98,code:`-- Gap tags per application, in display order (was the comma-joined gap_tags
-- column). The CHECK only admits short kebab-case slugs, so a free-text
-- sentence can never be stored as a "tag" again, which is the bug that once
-- shredded 11 ledger rows into comma fragments. The slug dictionary itself
-- stays in JobSearch/engine/gap_tags.yml (hand-curated, part of the fact
-- bank workflow), so there is deliberately no foreign key to it.
IF OBJECT_ID(N'dbo.ApplicationGapTags', N'U') IS NULL
CREATE TABLE dbo.ApplicationGapTags (
    ApplicationId INT          NOT NULL CONSTRAINT FK_ApplicationGapTags_Applications
                  REFERENCES dbo.Applications (Id) ON DELETE CASCADE,
    Slug          NVARCHAR(60) NOT NULL CONSTRAINT CK_ApplicationGapTags_Slug CHECK (
                      Slug <> N'' AND Slug COLLATE Latin1_General_BIN NOT LIKE N'%[^-a-z0-9]%'
                      AND Slug NOT LIKE N'-%' AND Slug NOT LIKE N'%-'),
    Position      TINYINT      NOT NULL,
    CONSTRAINT PK_ApplicationGapTags PRIMARY KEY (ApplicationId, Slug),
    CONSTRAINT UQ_ApplicationGapTags_Position UNIQUE (ApplicationId, Position)
);`},"schema/refuse":{file:"server/src/stores/migrate.js",start:41,end:48,code:`if (recordset[0].n > 0) {
  if (!replace) {
    throw new Error("The SQL database already has data. Re-run with --replace to clear it and copy again.");
  }
  await request().query(\`
    DELETE FROM dbo.PipelineEvents; DELETE FROM dbo.ApplicationGapTags;
    DELETE FROM dbo.Applications;   DELETE FROM dbo.Recruiters; DELETE FROM dbo.Stages;\`);
}`},"reporting/current":{file:"db/04-views.sql",start:15,end:22,code:`CREATE OR ALTER VIEW dbo.vApplicationCurrentStage AS
WITH LastStage AS (
    SELECT e.ApplicationId, e.StageKey, e.EventDate,
           ROW_NUMBER() OVER (PARTITION BY e.ApplicationId ORDER BY e.Id DESC) AS rn
    FROM dbo.PipelineEvents e
    JOIN dbo.Stages s ON s.StageKey = e.StageKey
    WHERE s.Kind <> N'action'
)`},"reporting/due":{file:"db/04-views.sql",start:44,end:51,code:`CREATE OR ALTER VIEW dbo.vFollowupsDue AS
SELECT c.Folder, c.Company, c.Role, c.CurrentStage, c.HasContactEmail,
       COALESCE(c.LastFollowupDate, c.StageSince) AS LastActionDate,
       DATEDIFF(day, COALESCE(c.LastFollowupDate, c.StageSince), CAST(SYSDATETIME() AS date)) AS DaysSinceAction
FROM dbo.vApplicationCurrentStage c
WHERE c.IsWaiting = 1
  AND c.StageSince IS NOT NULL
  AND DATEDIFF(day, COALESCE(c.LastFollowupDate, c.StageSince), CAST(SYSDATETIME() AS date)) > 7;`},"reporting/reader":{file:"db/05-reader-login.sql",start:17,end:22,code:`-- The views are owned by dbo like the tables they read, so ownership
-- chaining lets them work without granting anything on the tables.
GRANT SELECT ON dbo.vApplicationCurrentStage TO ledger_reader;
GRANT SELECT ON dbo.vFollowupsDue TO ledger_reader;
GRANT SELECT ON dbo.vFunnelBySource TO ledger_reader;
GRANT SELECT ON dbo.vGapTagStats TO ledger_reader;`},"reporting/kinds":{file:"db/06-report-views.sql",start:4,end:11,code:`-- Two kinds of views:
--   * Model tables for Power BI (reports/LedgerDashboard.pbip): one row per
--     application with every attribute a report slices by, plus events,
--     gap tags and recruiters. Measures live in the Power BI model.
--   * Ready-made summaries for plain SQL / the Control Panel assistant.
--
-- No personal data beyond what the dashboard already shows about the
-- employer: contact emails and recruiter names/LinkedIn URLs stay out.`},"reporting/week":{file:"db/06-report-views.sql",start:65,end:65,code:"DATEADD(day, -((DATEPART(weekday, ev.SentDate) + @@DATEFIRST - 2) % 7), ev.SentDate) AS SentWeek,"},"reporting/rptGrant":{file:"db/06-report-views.sql",start:186,end:186,code:"IF USER_ID(N'ledger_reader') IS NOT NULL GRANT SELECT ON SCHEMA::rpt TO ledger_reader;"}},a=[{area:"login",method:"POST",path:"/api/login",access:"public",file:"server/src/app.js",line:110},{area:"logout",method:"POST",path:"/api/logout",access:"public",file:"server/src/app.js",line:129},{area:"session",method:"GET",path:"/api/session",access:"public",file:"server/src/app.js",line:142},{area:"motivation",method:"GET",path:"/api/motivation",access:"signed-in",file:"server/src/app.js",line:183},{area:"pipeline-stages",method:"GET",path:"/api/pipeline-stages",access:"signed-in",file:"server/src/app.js",line:204},{area:"pipeline-events",method:"POST",path:"/api/pipeline-events",access:"signed-in",file:"server/src/app.js",line:214},{area:"pipeline-events",method:"POST",path:"/api/pipeline-events/followup",access:"signed-in",file:"server/src/app.js",line:242},{area:"pipeline-events",method:"POST",path:"/api/pipeline-events/undo",access:"signed-in",file:"server/src/app.js",line:261},{area:"applications",method:"POST",path:"/api/applications",access:"signed-in",file:"server/src/app.js",line:326},{area:"applications",method:"PATCH",path:"/api/applications/:id",access:"signed-in",file:"server/src/app.js",line:373},{area:"applications",method:"DELETE",path:"/api/applications/:id",access:"signed-in",file:"server/src/app.js",line:414},{area:"applications",method:"GET",path:"/api/applications",access:"signed-in",file:"server/src/app.js",line:434},{area:"applications",method:"GET",path:"/api/applications/:id",access:"signed-in",file:"server/src/app.js",line:443},{area:"usage",method:"GET",path:"/api/usage",access:"signed-in",file:"server/src/app.js",line:481},{area:"usage",method:"GET",path:"/api/usage/calls",access:"signed-in",file:"server/src/app.js",line:500},{area:"funnel",method:"GET",path:"/api/funnel",access:"signed-in",file:"server/src/app.js",line:513},{area:"rejections",method:"GET",path:"/api/rejections",access:"signed-in",file:"server/src/app.js",line:529},{area:"rejections",method:"POST",path:"/api/rejections/review",access:"signed-in",file:"server/src/app.js",line:547},{area:"applications",method:"GET",path:"/api/applications/:id/similar",access:"signed-in",file:"server/src/app.js",line:569},{area:"applications",method:"GET",path:"/api/applications/:id/files/:name",access:"signed-in",file:"server/src/app.js",line:594},{area:"gap-tags",method:"GET",path:"/api/gap-tags",access:"signed-in",file:"server/src/app.js",line:608},{area:"assistant",method:"POST",path:"/api/assistant",access:"signed-in",file:"server/src/app.js",line:920},{area:"packages",method:"POST",path:"/api/packages/analyze",access:"signed-in",file:"server/src/app.js",line:962},{area:"packages",method:"POST",path:"/api/packages/reanalyze",access:"signed-in",file:"server/src/app.js",line:1003},{area:"packages",method:"POST",path:"/api/packages/build",access:"signed-in",file:"server/src/app.js",line:1374},{area:"recruiters",method:"GET",path:"/api/recruiters",access:"signed-in",file:"server/src/app.js",line:1419},{area:"recruiters",method:"GET",path:"/api/recruiters/candidates",access:"signed-in",file:"server/src/app.js",line:1464},{area:"recruiters",method:"POST",path:"/api/recruiters/lookups",access:"signed-in",file:"server/src/app.js",line:1476},{area:"recruiters",method:"POST",path:"/api/recruiters",access:"signed-in",file:"server/src/app.js",line:1495},{area:"recruiters",method:"POST",path:"/api/recruiters/:id",access:"signed-in",file:"server/src/app.js",line:1535},{area:"eval",method:"GET",path:"/api/eval/items",access:"signed-in",file:"server/src/evalRoutes.js",line:39},{area:"eval",method:"PUT",path:"/api/eval/labels/:folder",access:"signed-in",file:"server/src/evalRoutes.js",line:61},{area:"eval",method:"GET",path:"/api/eval/report",access:"signed-in",file:"server/src/evalRoutes.js",line:94},{area:"interviews",method:"GET",path:"/api/interviews",access:"signed-in",file:"server/src/interviewRoutes.js",line:55},{area:"truth-bank",method:"GET",path:"/api/truth-bank",access:"signed-in",file:"server/src/truthRoutes.js",line:106},{area:"truth-bank",method:"POST",path:"/api/truth-bank/facts",access:"signed-in",file:"server/src/truthRoutes.js",line:141},{area:"truth-bank",method:"PUT",path:"/api/truth-bank/facts/:id",access:"signed-in",file:"server/src/truthRoutes.js",line:152},{area:"truth-bank",method:"DELETE",path:"/api/truth-bank/facts/:id",access:"signed-in",file:"server/src/truthRoutes.js",line:163},{area:"truth-bank",method:"GET",path:"/api/truth-bank/history",access:"signed-in",file:"server/src/truthRoutes.js",line:181},{area:"truth-bank",method:"GET",path:"/api/truth-bank/history/:hash",access:"signed-in",file:"server/src/truthRoutes.js",line:190},{area:"truth-bank",method:"POST",path:"/api/truth-bank/commit",access:"signed-in",file:"server/src/truthRoutes.js",line:201},{area:"gaps",method:"GET",path:"/api/gaps",access:"signed-in",file:"server/src/truthRoutes.js",line:214},{area:"gaps",method:"POST",path:"/api/gaps",access:"signed-in",file:"server/src/truthRoutes.js",line:247},{area:"gaps",method:"PUT",path:"/api/gaps/:slug",access:"signed-in",file:"server/src/truthRoutes.js",line:257},{area:"gaps",method:"POST",path:"/api/gaps/:slug/merge",access:"signed-in",file:"server/src/truthRoutes.js",line:273},{area:"resume",method:"GET",path:"/api/resume/templates",access:"signed-in",file:"server/src/truthRoutes.js",line:299},{area:"resume",method:"GET",path:"/api/resume/builds",access:"signed-in",file:"server/src/truthRoutes.js",line:310},{area:"applications",method:"GET",path:"/api/applications/:id/resume",access:"signed-in",file:"server/src/truthRoutes.js",line:327},{area:"health",method:"GET",path:"/api/health",access:"signed-in",file:"server/src/truthRoutes.js",line:367},{area:"health",method:"POST",path:"/api/health/dismiss",access:"signed-in",file:"server/src/truthRoutes.js",line:390},{area:"health",method:"DELETE",path:"/api/health/dismiss",access:"signed-in",file:"server/src/truthRoutes.js",line:403}],r=[{database:"LedgerDashboard",table:"Stages",file:"db/03-schema.sql",line:16,columns:[{name:"StageKey",type:"NVARCHAR(40)",nullable:!1,notes:["PK"]},{name:"Kind",type:"NVARCHAR(10)",nullable:!1,notes:["check Kind IN (N'stage', N'terminal', N'action')"]},{name:"SortOrder",type:"INT",nullable:!1,notes:[]},{name:"Label",type:"NVARCHAR(100)",nullable:!1,notes:[]},{name:"LabelFa",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"Icon",type:"NVARCHAR(16)",nullable:!1,notes:["default N''"]},{name:"IsWaiting",type:"BIT",nullable:!1,notes:["default 0"]}],denies:[]},{database:"LedgerDashboard",table:"Applications",file:"db/03-schema.sql",line:29,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Folder",type:"NVARCHAR(150)",nullable:!1,notes:["unique","check Folder <> N'' AND Folder NOT LIKE N'%..%' AND Folder COLLATE Latin1_General_BIN NOT LIKE N'%[^-A-Za-z0-9._]%'"]},{name:"AppliedDate",type:"DATE",nullable:!1,notes:[]},{name:"Company",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"Role",type:"NVARCHAR(300)",nullable:!1,notes:[]},{name:"Branch",type:"NVARCHAR(100)",nullable:!1,notes:["default N''"]},{name:"Source",type:"NVARCHAR(50)",nullable:!1,notes:["default N''"]},{name:"SourceDetail",type:"NVARCHAR(500)",nullable:!1,notes:["default N''"]},{name:"PosterType",type:"NVARCHAR(50)",nullable:!1,notes:["default N''"]},{name:"PosterName",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"EndClient",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"AppliedVia",type:"NVARCHAR(100)",nullable:!1,notes:["default N''"]},{name:"PostingUrl",type:"NVARCHAR(1000)",nullable:!1,notes:["default N''"]},{name:"DatePosted",type:"DATE",nullable:!0,notes:[]},{name:"DateSeen",type:"DATE",nullable:!0,notes:[]},{name:"Location",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"MatchScore",type:"TINYINT",nullable:!0,notes:["check MatchScore BETWEEN 0 AND 100"]},{name:"Variant",type:"NVARCHAR(40)",nullable:!1,notes:["default N''"]},{name:"Status",type:"NVARCHAR(40)",nullable:!1,notes:["default N'draft'"]},{name:"LastContact",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"NextAction",type:"NVARCHAR(1000)",nullable:!1,notes:["default N''"]},{name:"Outcome",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"Notes",type:"NVARCHAR(MAX)",nullable:!1,notes:["default N''"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]},{name:"ContactName",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"ContactEmail",type:"NVARCHAR(254)",nullable:!1,notes:["default N''"]},{name:"ContactSource",type:"NVARCHAR(20)",nullable:!1,notes:["default N''"]},{name:"ContactVerified",type:"BIT",nullable:!1,notes:["default 0"]}],denies:[],checks:["(ContactEmail = N'' AND ContactSource = N'') OR (ContactEmail LIKE N'_%@_%._%' AND ContactSource IN (N'posting', N'ats_email', N'recruiter_reply', N'found') AND ContactVerified = 1)"]},{database:"LedgerDashboard",table:"ApplicationGapTags",file:"db/03-schema.sql",line:89,columns:[{name:"ApplicationId",type:"INT",nullable:!1,notes:["PK","→ Applications"]},{name:"Slug",type:"NVARCHAR(60)",nullable:!1,notes:["PK","check Slug <> N'' AND Slug COLLATE Latin1_General_BIN NOT LIKE N'%[^-a-z0-9]%' AND Slug NOT LIKE N'-%' AND Slug NOT LIKE N'%-'"]},{name:"Position",type:"TINYINT",nullable:!1,notes:[]}],denies:[],uniques:["(ApplicationId, Position)"]},{database:"LedgerDashboard",table:"PipelineEvents",file:"db/03-schema.sql",line:105,columns:[{name:"Id",type:"BIGINT",nullable:!1,notes:["PK","identity"]},{name:"ApplicationId",type:"INT",nullable:!1,notes:["→ Applications"]},{name:"StageKey",type:"NVARCHAR(40)",nullable:!1,notes:["→ Stages"]},{name:"EventDate",type:"DATE",nullable:!1,notes:[]},{name:"EventTime",type:"TIME(0)",nullable:!0,notes:[]},{name:"Note",type:"NVARCHAR(1000)",nullable:!1,notes:["default N''"]},{name:"CreatedAt",type:"DATETIME2(0)",nullable:!1,notes:["default SYSUTCDATETIME()"]}],denies:[]},{database:"LedgerDashboard",table:"Recruiters",file:"db/03-schema.sql",line:123,columns:[{name:"Id",type:"INT",nullable:!1,notes:["PK","identity"]},{name:"Name",type:"NVARCHAR(200)",nullable:!1,notes:[]},{name:"Title",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"Company",type:"NVARCHAR(200)",nullable:!1,notes:["default N''"]},{name:"LinkedInUrl",type:"NVARCHAR(400)",nullable:!1,notes:["default N''","unique where LinkedInUrl <> N''"]},{name:"Source",type:"NVARCHAR(50)",nullable:!1,notes:["default N''"]},{name:"DateAdded",type:"DATE",nullable:!0,notes:[]},{name:"ConnectNote",type:"NVARCHAR(1000)",nullable:!1,notes:["default N''"]},{name:"ConnectSentOn",type:"DATE",nullable:!0,notes:[]},{name:"ConnectAcceptedOn",type:"DATE",nullable:!0,notes:[]},{name:"FollowupNote",type:"NVARCHAR(1000)",nullable:!1,notes:["default N''"]},{name:"FollowupSentOn",type:"DATE",nullable:!0,notes:[]},{name:"RepliedOn",type:"DATE",nullable:!0,notes:[]},{name:"Notes",type:"NVARCHAR(1000)",nullable:!1,notes:["default N''"]}],denies:[]}],i=[{path:"/",component:"ApplicationsList",guards:[]},{path:"/applications/new",component:"NewApplication",guards:[]},{path:"/packages/new",component:"NewPackage",guards:[]},{path:"/applications/:id",component:"ApplicationDetail",guards:[]},{path:"/pipeline",component:"PipelineBoard",guards:[]},{path:"/stats",component:"StatsPage",guards:[]},{path:"/funnel",component:"FunnelPage",guards:[]},{path:"/rejections",component:"RejectionsPage",guards:[]},{path:"/recruiters",component:"RecruitersBoard",guards:[]},{path:"/interviews",component:"InterviewsPage",guards:[]},{path:"/truth",component:"TruthBankPage",guards:[]},{path:"/gaps",component:"GapsPage",guards:[]},{path:"/resume",component:"ResumePage",guards:[]},{path:"/resume/:folder",component:"BuiltResumePage",guards:[]},{path:"/health",component:"HealthPage",guards:[]},{path:"/costs",component:"CostsPage",guards:[]},{path:"/eval",component:"EvalPage",guards:[]}],o={project:e,repo:t,files:n,examples:s,endpoints:a,tables:r,routes:i};export{o as default,a as endpoints,s as examples,n as files,e as project,t as repo,i as routes,r as tables};
