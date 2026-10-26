# Programming Lessons · درس‌های برنامه‌نویسی

Lessons built on real project code, each concept compared side by side, with C# as the
language the reader already knows. Persian text, code in the original language.

Site: https://code.arashkeshtgar.ca (the VPS, deployed by Control Panel) and
https://arashkeshtgar.github.io/ProgrammingLessonDesigner/ (GitHub Pages, with the PDFs). Installable as an app.

| Booklet | Lessons | Columns |
|---|---|---|
| Backend | 12: concurrency, HTTP API, DI, SQL, validation, errors, JWT, testing, MongoDB, webhooks, outbox, LLM tools | C# · TypeScript · Python · Java |
| Docker | 3: multi-stage Dockerfiles, compose, configuration and secrets | the same four services |
| Frontend | 4: components, HTTP with token refresh, route guards, forms | Blazor · Angular · React · Vue |
| Ops | 8: strict scripts, server setup, release, deploy, nightly backup, restore test, CI/CD, reverse proxy | Bash · PowerShell · Python (CI/CD: GitHub Actions · Azure Pipelines; proxy: Caddy · nginx) |

The **Projects** tab (`#/projects/fa`, `#/projects/en`) is a bilingual reference for the
whole portfolio, laid out like a docs site: a system map of every project and what it
talks to, one page per project, and a page on how this site is styled.

Each booklet is also a page (`#/booklet/<tag>`) and a PDF built by CI (`pdf/<tag>.pdf`).
The review page turns compare rows, pitfalls and exercises into spaced-repetition cards.

## How a lesson is made

One JSON file per lesson in `src/data/lessons/` (types in `src/types/lesson.ts`):
`goal` → `story` (the real scenario) → `concepts` → `compare` (table) → `code` → `pitfalls` →
`refs` (file and line in the real projects) → `exercises` → `take` (interview sentence).

A code sample is one of:

- `tested`: `file` + `region` under `examples/`. The page shows the lines between
  `#region <name>` and `#endregion` of a file that CI compiles and tests.
- `real`: inline `code` shortened from one of the real projects (see `refs`).
- `port`: inline `code` written for the lesson and not run (avoid; only the Azure Pipelines
  column of the CI/CD lesson, which has no runner here).

`npm run check` validates every lesson: required fields, every language present, every
`examples/` file and region exists, and (locally, where `D:/E/Projects` exists) every ref
points at an existing file and line.

## Projects tab

- `src/data/project-map.json` is generated, never edited: `npm run map` reads Control
  Panel's compose files, the VPS overlay, the Caddyfile and the VPS env template (read
  only) and writes it. `npm run check` fails locally when it no longer matches them.
- `src/data/topics/<project>.json`: the project as topics, W3Schools-style (so far Control
  Panel, 29 topics in 6 groups; ClinicHub, 26 in 8; LabFlow, 21 in 8; ClinicReport, 19 in 7;
  LedgerDashboard, 19 in 7; ReBiomed, 20 in 8; FinancePowerApp, 18 in 7; this site, 21 in 7). Each topic
  lists its files and quotes the real code, found by text anchors (`from` / `to` or `lines`). `npm run code`
  snapshots those excerpts, plus what its `scan` reads from the code: endpoints (NestJS, Express in
  TypeScript or JavaScript, including routers mounted with `app.use` and their `auth`/`admin`
  middleware, ASP.NET Core Minimal APIs), tables (SQL scripts, including columns, CHECKs and foreign
  keys added by `ALTER TABLE`, computed columns, unique keys over several columns and column-level
  DENYs; EF Core model snapshots for SQL Server or SQLite; Mongoose schemas with their subdocuments
  and indexes) and routes (Angular, React, including a route behind a permission check or a guard
  component, and Vue Router), into `<project>.code.json`. A repo outside `D:/E/Projects` is named
  by `path` (relative to it); `npm run check` fails locally when a
  snapshot no longer matches the repo, and when a topic's Persian and English differ.
- `src/data/projects/<id>.json`: the hand-written page of a project, a summary and
  optionally sections in both `fa` and `en` (same section ids), with code examples shared
  by the two languages and `refs` into the real projects. `npm run check` validates them.
- Styles are Sass in `src/styles/`: `abstracts/` (tokens, functions, mixins; no CSS of
  their own), `base/`, `components/`, `projects/`. Colours exist only in
  `abstracts/_tokens.scss`, and the build stops when a text colour pair, in either theme,
  is below WCAG's 4.5:1. `npm run lint:css` runs stylelint.

## Examples

| Folder | What | Verified by |
|---|---|---|
| `examples/backend/python` | FastAPI | `pytest` (22 tests) |
| `examples/backend/typescript` | Express | `tsc` + `node --test` (22) |
| `examples/backend/csharp` | ASP.NET Core Minimal API | `dotnet test` (21) |
| `examples/backend/java` | Spring Boot | `mvn test` (21) |
| `examples/frontend/web` | Angular, React, Vue | `tsc` / `vue-tsc` + `node --test` (4) |
| `examples/frontend/blazor` | Blazor components | `dotnet test` with bUnit (3) |
| `examples/docker` | compose for the four services | `docker compose up --wait` + `/status` |
| `examples/ops` | the VPS scripts, each in Bash, PowerShell and Python | `shellcheck`, `PSScriptAnalyzer`, `actionlint`, then `tests/run.sh` in an Ubuntu 24.04 container (real sshd, git, sqlite) and `proxy/test.sh` (Caddy and nginx with curl) |

MongoDB tests run when `MONGO_URL` is set (CI starts a `mongo:7` service). Locally:

```bash
docker run -d --name lessons-mongo -p 27017:27017 mongo:7
```

The Angular examples are type-checked, but their templates are not compiled.

The ops tests run as root in their container (they rewrite sshd's config and start sshd):

```bash
docker build -t lessons-ops examples/ops && docker run --rm lessons-ops
examples/ops/proxy/test.sh
```

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # lessons, Projects pages, the map and the code snapshots against the repos
npm run lint:css # stylelint
npm run build
npm run pdf      # needs a served build: npx vite preview, then SITE_URL=http://localhost:4173/ npm run pdf
```

## Deploy

`.github/workflows/deploy-pages.yml`: on every push to `main` it runs all the example
tests, builds and starts the Docker stack, builds the site, prints the PDFs and publishes
`dist` to the `gh-pages` branch, which GitHub Pages serves. Nothing is deployed if a test fails.
