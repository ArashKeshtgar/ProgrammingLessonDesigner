import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// For a GitHub Pages build pass --base=/ProgrammingLessonDesigner/ on the CLI.
export default defineConfig({
  plugins: [vue()],
  // Sass's modern API; the legacy one is deprecated and prints a warning per file.
  css: { preprocessorOptions: { scss: { api: 'modern' } } },
})
