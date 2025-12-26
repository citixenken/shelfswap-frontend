<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">Browse by Genre</h1>

        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else-if="genres.length === 0"
             class="text-center text-gray-500 dark:text-gray-400">
            No book genre added yet
        </div>

        <div v-else
             class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <router-link v-for="genre in genres"
                         :key="genre"
                         :to="{ path: '/books', query: { genre: genre } }"
                         class="bg-white dark:bg-gray-800 p-6 rounded shadow hover:shadow-lg transition-shadow text-center block">
                <h2 class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ genre }}</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">View Books</p>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import API_BASE_URL from '../config/api'

const genres = ref([])
const loading = ref(true)
const error = ref('')
const route = useRoute()

const fetchGenres = async () => {
    loading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/genres`)
        if (!res.ok) throw new Error('Failed to fetch genres')
        genres.value = await res.json()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(fetchGenres)
</script>
