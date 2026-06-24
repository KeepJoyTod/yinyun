import { createApp } from 'vue'
import './style.css'
import App from './app/App.vue'
import router from './app/router'

const app = createApp(App).use(router)
void router.isReady().then(() => app.mount('#app'))
