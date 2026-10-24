import { createApp } from 'vue'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/jetbrains-mono/400.css'
import './styles/main.scss'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

// Installable app: the service worker caches what was fetched, so lessons open offline.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
}
