// Prints each booklet page (/#/booklet/<tag>) of a running site to dist/pdf/<tag>.pdf.
// The site must already be served: `vite preview` locally or in CI. SITE_URL is the
// address of the app root, e.g. http://localhost:4173/ProgrammingLessonDesigner/
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const site = process.env.SITE_URL ?? 'http://localhost:4173/'
const out = path.join(root, 'dist', 'pdf')
const BOOKLETS = ['backend', 'frontend', 'docker', 'ops']

mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
try {
  for (const tag of BOOKLETS) {
    // A fresh page per booklet: only the #hash differs, and a same-page hash change is not a load.
    const page = await browser.newPage()
    await page.goto(`${site}#/booklet/${tag}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('.booklet-lesson')
    await page.evaluate(() => document.fonts.ready)
    const file = path.join(out, `${tag}.pdf`)
    await page.pdf({
      path: file,
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#888;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    })
    console.log(`wrote ${path.relative(root, file)}`)
    await page.close()
  }
} finally {
  await browser.close()
}
