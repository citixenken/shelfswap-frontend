<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">Book List</h1>

        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div class="w-full md:w-1/2">
                <input v-model="searchQuery"
                       @input="handleSearch"
                       type="text"
                       placeholder="Search by title or author..."
                       class="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            </div>
            <div class="w-full md:w-auto flex gap-4">
                <select v-model="sortOrder"
                        @change="handleSort"
                        class="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
                <router-link to="/add"
                             class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors whitespace-nowrap">
                    Add Book
                </router-link>
            </div>
        </div>

        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link v-for="book in books"
                         :key="book.id"
                         :to="`/books/${book.id}`"
                         class="p-4 border rounded shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                <div class="flex gap-4">
                    <div class="w-24 h-36 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded overflow-hidden">
                        <img v-if="book.image_path"
                             :src="book.image_path"
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
                    <div class="flex-1">
                        <h2 class="text-xl font-semibold dark:text-white line-clamp-2">{{ book.title }}</h2>
                        <p class="text-gray-600 dark:text-gray-400">by {{ book.author }}</p>
                        <p class="text-gray-500 dark:text-gray-500 text-sm mt-2 line-clamp-3">{{ book.description }}</p>
                    </div>
                </div>
                <div
                     class="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
                    <div
                         class="w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-2 flex items-center justify-center">
                        <img v-if="book.user_avatar_path"
                             :src="book.user_avatar_path"
                             alt="Avatar"
                             class="w-full h-full object-cover">
                        <span v-else
                              class="text-xs font-bold text-gray-500 dark:text-gray-300">{{ (book.user_username ||
                                book.user_email || 'T').charAt(0).toUpperCase() }}</span>
                    </div>
                    <span>
                        Added by {{ book.user_username || book.user_email || 'ShelfSwap Member' }} on {{
                            formatDate(book.created_at) }}
                    </span>
                </div>
            </router-link>
            <div v-if="books.length === 0"
                 class="text-center col-span-full text-gray-500 dark:text-gray-400">
                No books found.
            </div>
        </div>

        <div class="mt-8 flex justify-center gap-4">
            <button v-if="offset > 0"
                    @click="prevPage"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-gray-600 dark:hover:bg-gray-800">
                Previous
            </button>
            <button v-if="books.length === limit"
                    @click="nextPage"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-600 dark:hover:bg-blue-800">
                Next
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import API_BASE_URL from '../config/api'

import { useAuth } from '../stores/auth'

const route = useRoute()
const { getToken } = useAuth()
const books = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const sortOrder = ref('newest')
const limit = ref(9)
const offset = ref(0)
const hasMore = ref(true)

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) + '; ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    })
}

let debounceTimeout = null

const fetchBooks = async (reset = false) => {
    if (reset) {
        offset.value = 0
        books.value = []
        hasMore.value = true
    }

    if (loading.value && !reset) return // Don't fetch if already loading, unless resetting

    loading.value = true
    error.value = '' // Clear previous errors
    try {
        const genre = route.query.genre || '' // Get genre from route query
        const queryParams = new URLSearchParams({
            q: searchQuery.value,
            sort: sortOrder.value,
            limit: limit.value.toString(),
            offset: offset.value.toString(),
            genre: genre // Add genre to query params
        })

        const headers = {}
        const token = await getToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(`${API_BASE_URL}/books?${queryParams}`, { headers })
        if (!res.ok) throw new Error('Failed to fetch books')
        const newBooks = await res.json() || []

        if (newBooks.length < limit.value) {
            hasMore.value = false
        } else {
            hasMore.value = true
        }

        books.value = newBooks

        window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

// Watch for route query changes (e.g. genre change)
watch(() => route.query, () => {
    fetchBooks(true)
})

const nextPage = () => {
    offset.value += limit.value
    fetchBooks()
}

const prevPage = () => {
    offset.value = Math.max(0, offset.value - limit.value)
    fetchBooks()
}

const handleSearch = () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        offset.value = 0
        fetchBooks(true)
    }, 300)
}

const handleSort = () => {
    offset.value = 0
    fetchBooks(true)
}

onMounted(() => {
    fetchBooks()
})
</script>
