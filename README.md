# Programming Lessons · درس‌های برنامه‌نویسی

Backend (and later frontend / Docker) lessons built on real project code, each concept compared across
**C#, TypeScript, Python and Java**. Persian text, code in the original language.

Each lesson is one JSON file in `src/data/lessons/` (`l001-…json`). The `tag` field picks the booklet
(`backend`, `frontend`, `docker`, …), so one lesson set produces several booklets.

## Lesson shape

`goal` → `story` (real scenario) → `concepts` → `compare` (4-language table) → `code` (tabbed samples) →
`pitfalls` → `refs` (file and line in the real project) → `exercises` → `take` (interview sentence).
Types are in `src/types/lesson.ts`. A code sample is `origin: "real"` (shortened from a project file) or
`"port"` (written as the equivalent); the page says which.

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # validates lessons; also checks refs against LESSON_REFS_ROOT (default D:/E/Projects)
npm run build
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds with
`--base=/<repo>/` and publishes to GitHub Pages. The site is an installable app (manifest + a small
service worker): "Add to Home screen" / "Install".
Settings → Pages → Source must be **GitHub Actions**.
