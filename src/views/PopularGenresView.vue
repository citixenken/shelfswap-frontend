<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">Popular Genres</h1>

        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else
             class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <router-link v-for="genre in genres"
                         :key="genre.genre"
                         :to="`/books?genre=${genre.genre}`"
                         class="p-6 border rounded shadow bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer text-center group">
                <h2 class="text-xl font-semibold dark:text-white group-hover:text-blue-500">{{ genre.genre }}</h2>
                <p class="text-gray-500 dark:text-gray-400 mt-2">{{ genre.book_count }} {{ genre.book_count === 1 ?
                    'Book' : 'Books' }}</p>
            </router-link>
            <div v-if="genres.length === 0"
                 class="text-center col-span-full text-gray-500 dark:text-gray-400">
                No genres found.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import API_BASE_URL from '../config/api'

const genres = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/genres/popular`)
        if (!res.ok) throw new Error('Failed to fetch genres')
        genres.value = await res.json()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>
