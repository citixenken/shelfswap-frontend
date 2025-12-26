<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">Top Requested Books</h1>

        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link v-for="book in books"
                         :key="book.book_id"
                         :to="`/books/${book.book_id}`"
                         class="p-4 border rounded shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                <div class="flex items-start space-x-4">
                    <div class="w-20 h-28 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded overflow-hidden">
                        <img v-if="book.image_path"
                             :src="book.image_path"
                             class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h2 class="text-xl font-semibold dark:text-white line-clamp-2">{{ book.title }}</h2>
                        <p class="text-gray-600 dark:text-gray-400">by {{ book.author }}</p>
                        <p class="text-blue-500 font-bold mt-2">{{ book.request_count }} {{ book.request_count === 1 ?
                            'Request' : 'Requests' }}</p>
                    </div>
                </div>
            </router-link>
            <div v-if="books.length === 0"
                 class="text-center col-span-full text-gray-500 dark:text-gray-400">
                No top books found.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import API_BASE_URL from '../config/api'

const books = ref([])
const loading = ref(true)
const error = ref('')
const route = useRoute()

const fetchBooks = async () => {
    loading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/books/top-requested?limit=20`)
        if (!res.ok) throw new Error('Failed to fetch top books')
        books.value = await res.json()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(fetchBooks)
</script>
