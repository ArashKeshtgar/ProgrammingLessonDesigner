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
npm run check
npm run build
npm run pdf      # needs a served build: npx vite preview, then SITE_URL=http://localhost:4173/ npm run pdf
```

## Deploy

`.github/workflows/deploy-pages.yml`: on every push to `main` it runs all the example
tests, builds and starts the Docker stack, builds the site, prints the PDFs and publishes
`dist` to the `gh-pages` branch, which GitHub Pages serves. Nothing is deployed if a test fails.
