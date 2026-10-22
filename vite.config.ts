import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// For a GitHub Pages build pass --base=/ProgrammingLessonDesigner/ on the CLI.
export default defineConfig({ plugins: [vue()] })
