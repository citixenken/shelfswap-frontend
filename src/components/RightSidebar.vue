<template>
    <div
         class="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 p-4 hidden lg:block h-screen sticky top-0 overflow-y-auto">
        <div class="mb-8">
            <h3 class="text-lg font-bold mb-4 dark:text-white">Top Books</h3>
            <div v-if="loadingTopBooks"
                 class="text-sm text-gray-500">Loading...</div>
            <div v-else-if="topBooks.length === 0"
                 class="text-sm text-gray-500">No book found</div>
            <ul v-else
                class="space-y-3">
                <li v-for="book in topBooks"
                    :key="book.book_id">
                    <router-link :to="`/books/${book.book_id}`"
                                 class="flex items-start space-x-3 group">
                        <div class="w-10 h-14 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded overflow-hidden">
                            <img v-if="book.image_path"
                                 :src="book.image_path"
                                 class="w-full h-full object-cover">
                        </div>
                        <div>
                            <p
                               class="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-500 line-clamp-2">
                                {{ book.title }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ book.author }}</p>
                            <p class="text-xs text-gray-400 mt-1">
                                {{ book.request_count }} {{ book.request_count === 1 ? 'request' : 'requests' }}
                            </p>
                        </div>
                    </router-link>
                </li>
            </ul>
            <router-link to="/books/top"
                         class="block mt-4 text-sm text-blue-500 hover:underline">View All Top Books</router-link>
        </div>

        <div>
            <h3 class="text-lg font-bold mb-4 dark:text-white">Popular Genres</h3>
            <div v-if="loadingGenres"
                 class="text-sm text-gray-500">Loading...</div>
            <div v-else-if="popularGenres.length === 0"
                 class="text-sm text-gray-500">No Genre added yet</div>
            <div v-else
                 class="flex flex-wrap gap-2">
                <router-link v-for="genre in popularGenres"
                             :key="genre.genre"
                             :to="`/books?genre=${genre.genre}`"
                             class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                    {{ genre.genre }} ({{ genre.book_count }})
                </router-link>
            </div>
            <router-link to="/genres/popular"
                         class="block mt-4 text-sm text-blue-500 hover:underline">View All Popular Genres</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const topBooks = ref([])
const popularGenres = ref([])
const loadingTopBooks = ref(true)
const loadingGenres = ref(true)

import { useRoute } from 'vue-router'

const route = useRoute()

const fetchTopBooks = async () => {
    loadingTopBooks.value = true
    try {
        const res = await fetch('/api/books/top-requested?limit=5')
        if (res.ok) {
            topBooks.value = await res.json()
        }
    } catch (e) {
        console.error('Failed to fetch top books', e)
    } finally {
        loadingTopBooks.value = false
    }
}

const fetchPopularGenres = async () => {
    loadingGenres.value = true
    try {
        const res = await fetch('/api/genres/popular')
        if (res.ok) {
            popularGenres.value = await res.json()
        }
    } catch (e) {
        console.error('Failed to fetch popular genres', e)
    } finally {
        loadingGenres.value = false
    }
}

import { watch } from 'vue'

watch(() => route.path, () => {
    fetchTopBooks()
    fetchPopularGenres()
})

onMounted(() => {
    fetchTopBooks()
    fetchPopularGenres()
})
</script>
