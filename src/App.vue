<template>
  <div class="min-h-screen bg-papayawhip dark:bg-gray-900 flex flex-col transition-colors duration-300">
    <nav class="bg-white dark:bg-gray-800 shadow transition-colors duration-300 z-40 relative">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <button v-if="showSidebar"
                  @click="isSidebarOpen = true"
                  class="mr-4 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 focus:outline-none md:hidden">
            <svg class="w-6 h-6"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <router-link to="/"
                       class="text-xl font-bold text-indigo-600 dark:text-indigo-400">ShelfSwap</router-link>
        </div>
        <div class="space-x-4 flex items-center">
          <router-link to="/books"
                       class="hidden md:inline-block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">List
            Books</router-link>
          <SignedIn>
            <router-link to="/add"
                         class="hidden md:inline-block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Add
              Book</router-link>
            <span class="hidden lg:inline-block text-gray-700 dark:text-gray-300 font-medium">
              {{ greeting }}
            </span>
            <UserButton afterSignOutUrl="/" />
            <router-link to="/chats"
                         class="relative text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
              <svg class="w-6 h-6"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24">
                <path stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
                </path>
              </svg>
              <span v-if="unreadCount > 0"
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{{
                      unreadCount }}</span>
            </router-link>
          </SignedIn>
          <SignedOut>
            <router-link to="/login"
                         class="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Login</router-link>
            <router-link to="/register"
                         class="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">Register</router-link>
          </SignedOut>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>

    <div class="flex flex-grow relative">
      <Sidebar v-if="showSidebar"
               :isOpen="isSidebarOpen"
               :unreadCount="unreadCount"
               @close="isSidebarOpen = false" />

      <div class="flex-grow w-full min-w-0">


        <router-view :key="$route.fullPath" />
      </div>

      <RightSidebar v-if="showSidebar" />
    </div>
    <TheFooter />
    <ToastNotification />
    <CookieConsent />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, UserButton, SignedIn, SignedOut } from '@clerk/vue'
import { useAuth as useLocalAuth } from './stores/auth'
import TheFooter from './components/TheFooter.vue'
import ToastNotification from './components/ToastNotification.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import Sidebar from './components/Sidebar.vue'
import RightSidebar from './components/RightSidebar.vue'
import CookieConsent from './components/CookieConsent.vue'
import API_BASE_URL from './config/api'

const isSidebarOpen = ref(false)
const { isSignedIn } = useAuth()
const { checkAuth, user, getToken } = useLocalAuth()
const router = useRouter()
const route = useRoute()
const unreadCount = ref(0)
let notificationInterval

const showSidebar = computed(() => {
  return !['/', '/login', '/register'].includes(route.path)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  const username = user.value?.username || user.value?.email?.split('@')[0] || 'there'

  if (hour < 12) {
    return `Good morning, ${username}!`
  } else if (hour < 18) {
    return `Good afternoon, ${username}!`
  } else {
    return `Good evening, ${username}!`
  }
})


const fetchUnreadCount = async () => {
  if (!isSignedIn.value) {
    console.log('[Notifications] User not signed in, skipping fetch')
    return
  }
  try {
    const token = await getToken()
    console.log('[Notifications] Fetching unread count...')
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log('[Notifications] Response status:', res.status)
    if (res.ok) {
      const data = await res.json()
      console.log('[Notifications] Unread count:', data.count)
      unreadCount.value = data.count
    } else {
      console.error('[Notifications] Failed to fetch:', res.status, await res.text())
    }
  } catch (e) {
    console.error('[Notifications] Error fetching unread count:', e)
  }
}

const dropdownRef = ref(null)

// SSE connection management
let eventSource = null

const connectSSE = async () => {
  if (!isSignedIn.value) return

  try {
    const token = await getToken()
    // Note: EventSource doesn't support custom headers, so we pass token as query param
    const url = `${API_BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`

    eventSource = new EventSource(url)

    eventSource.addEventListener('unread-count', (event) => {
      try {
        const data = JSON.parse(event.data)
        unreadCount.value = data.count
      } catch (e) {
        console.error('[SSE] Failed to parse event data:', e)
      }
    })

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error)
      eventSource.close()
      // Retry connection after 5 seconds
      setTimeout(() => {
        if (isSignedIn.value) {
          connectSSE()
        }
      }, 5000)
    }

    eventSource.onopen = () => {
      console.log('[SSE] Connection established')
    }
  } catch (e) {
    console.error('[SSE] Failed to connect:', e)
  }
}

const disconnectSSE = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

// Fetch local user data when app mounts
// Watch for auth state changes to start/stop SSE
watch(isSignedIn, (newVal) => {
  console.log('[Notifications] Auth state changed:', newVal)
  if (newVal) {
    checkAuth()
    connectSSE()
  } else {
    disconnectSSE()
    unreadCount.value = 0
  }
}, { immediate: true })

onUnmounted(() => {
  disconnectSSE()
})
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  font-family: "Space Grotesk", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
}
</style>
