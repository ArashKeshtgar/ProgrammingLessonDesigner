import { createApp } from 'vue'
import './assets/app.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

// Installable app: the service worker only caches the shell, lessons are bundled JS.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
}
