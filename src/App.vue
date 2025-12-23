<template>
  <div class="min-h-screen bg-papayawhip dark:bg-gray-900 flex flex-col transition-colors duration-300">
    <nav class="bg-white dark:bg-gray-800 shadow transition-colors duration-300 z-40 relative">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <button @click="isSidebarOpen = true"
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
               @close="isSidebarOpen = false" />

      <div class="flex-grow w-full">


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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, UserButton, SignedIn, SignedOut } from '@clerk/vue'
import { useAuth as useLocalAuth } from './stores/auth'
import TheFooter from './components/TheFooter.vue'
import ToastNotification from './components/ToastNotification.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import Sidebar from './components/Sidebar.vue'
import RightSidebar from './components/RightSidebar.vue'
import CookieConsent from './components/CookieConsent.vue'

const isSidebarOpen = ref(false)
const { isSignedIn } = useAuth()
const { checkAuth, user } = useLocalAuth()
const router = useRouter()
const route = useRoute()

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

const dropdownRef = ref(null)

// Fetch local user data when app mounts
onMounted(() => {
  if (isSignedIn.value) {
    checkAuth()
  }
})
// Dropdown logic removed as UserButton handles it
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
