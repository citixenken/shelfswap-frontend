<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">My Wishlist</h1>

        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else-if="requests.length === 0"
             class="text-center text-gray-500 dark:text-gray-400">
            No book added yet on wishlist
        </div>

        <div v-else
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link v-for="req in requests"
                         :key="req.id"
                         :to="`/books/${req.book_id}`"
                         class="bg-white dark:bg-gray-800 p-4 rounded shadow flex space-x-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="w-24 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded overflow-hidden">
                    <img v-if="req.book_image"
                         :src="req.book_image"
                         alt="Book Cover"
                         class="w-full h-full object-cover">
                    <div v-else
                         class="w-full h-full flex items-center justify-center text-gray-400">
                        <svg class="w-8 h-8"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                            </path>
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col justify-between">
                    <div>
                        <h2 class="text-lg font-bold dark:text-white line-clamp-1">{{ req.book_title }}</h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ req.book_author }}</p>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-500">Requested on {{ new
                        Date(req.created_at).toLocaleDateString() }}</p>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '../stores/auth'
import { useRoute } from 'vue-router'
import API_BASE_URL from '../config/api'

const requests = ref([])
const loading = ref(true)
const error = ref('')
const route = useRoute()
const { getToken } = useAuth()

const fetchRequests = async () => {
    loading.value = true
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/wishlist`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error('Failed to fetch wishlist')
        const data = await res.json()
        requests.value = data || []
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(fetchRequests)
</script>
