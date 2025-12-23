<template>
    <footer class="bg-white dark:bg-gray-800 shadow mt-auto transition-colors duration-300">
        <div
             class="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-gray-600 dark:text-gray-400 space-y-4 md:space-y-0">
            <div class="flex space-x-4 text-sm">
                <router-link to="/terms"
                             class="hover:text-indigo-600 dark:hover:text-indigo-400">Terms</router-link>
                <router-link to="/privacy"
                             class="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</router-link>
                <router-link to="/contact"
                             class="hover:text-indigo-600 dark:hover:text-indigo-400">Contact Us</router-link>
            </div>
            <div class="flex flex-col items-center md:items-end">
                <p>&copy; {{ new Date().getFullYear() }} ShelfSwap. All rights reserved.</p>
                <p class="text-xs mt-1">Backend Status: {{ status }}</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const status = ref('Checking...')

onMounted(async () => {
    try {
        const res = await fetch('/api/health')
        const data = await res.json()
        status.value = data.status
    } catch (e) {
        status.value = 'Error'
    }
})
</script>
