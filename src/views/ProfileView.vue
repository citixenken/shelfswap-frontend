<template>
    <div class="container mx-auto p-4">
        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>
        <div v-else
             class="max-w-4xl mx-auto">
            <div
                 class="bg-white dark:bg-gray-800 p-6 rounded shadow-md mb-6 flex flex-col md:flex-row items-center gap-6">
                <div
                     class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-3xl font-bold">
                    <img v-if="user?.avatar_path"
                         :src="user.avatar_path"
                         alt="Avatar"
                         class="w-full h-full object-cover">
                    <span v-else>{{ userInitial }}</span>
                </div>
                <div class="flex-1 text-center md:text-left">
<!--                    <h1 class="text-2xl font-bold mb-2 dark:text-white">{{ user?.email }}</h1>-->
                    <h1 class="text-2xl font-bold mb-2 dark:text-white">{{ user?.username || 'Not set' }}</h1>
<!--                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">-->
<!--                        <span class="font-semibold">Username:</span> {{ user?.username || 'Not set' }}-->
<!--                    </p>-->
                    <p v-if="user?.bio"
                       class="text-gray-700 dark:text-gray-300 mb-2 italic">{{ user?.bio }}</p>
                    <p v-if="user?.location"
                       class="text-gray-500 dark:text-gray-500 text-sm mb-2">
                        <svg class="w-4 h-4 inline mr-1"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                            </path>
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {{ user?.location }}
                    </p>
                    <div class="space-y-1">
                        <p class="text-gray-600 dark:text-gray-400">Joined: {{ formatDate(user?.created_at) }}</p>
                        <p class="text-gray-600 dark:text-gray-400">Books Added: {{ books.length }}</p>
                    </div>
                </div>
            </div>

            <h2 class="text-xl font-bold mb-4 dark:text-white">My Books</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <router-link v-for="book in books"
                             :key="book.id"
                             :to="`/books/${book.id}`"
                             class="p-4 border rounded shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer">
                    <div class="flex gap-4">
                        <div class="w-20 h-28 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded overflow-hidden">
                            <img v-if="book.image_path"
                                 :src="book.image_path"
                                 alt="Book Cover"
                                 class="w-full h-full object-cover">
                            <div v-else
                                 class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-6 h-6"
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
                            <p class="text-gray-500 dark:text-gray-500 text-sm mt-2 line-clamp-3">{{ book.description }}
                            </p>
                        </div>
                    </div>
                </router-link>
                <div v-if="books.length === 0"
                     class="text-center col-span-full text-gray-500 dark:text-gray-400 py-8">
                    You haven't added any books yet.
                    <router-link to="/add"
                                 class="text-blue-500 hover:underline">Add one now!</router-link>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'

const books = ref([])
const loading = ref(true)
const error = ref('')
const { user, getToken } = useAuth()

const userInitial = computed(() => {
    if (user.value && user.value.email) {
        return user.value.email.charAt(0).toUpperCase()
    }
    return 'U'
})

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const fetchUserBooks = async () => {
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/my-books`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!res.ok) {
            throw new Error('Failed to fetch your books')
        }
        books.value = await res.json()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(fetchUserBooks)
</script>
