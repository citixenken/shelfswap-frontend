import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

import { clerkPlugin } from '@clerk/vue'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createApp(App)
  .use(router)
  .use(clerkPlugin, {
    publishableKey: PUBLISHABLE_KEY
  })
  .mount('#app')
