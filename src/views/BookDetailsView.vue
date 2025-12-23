<template>
    <div class="container mx-auto p-4">
        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>
        <div v-else-if="book"
             class="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow-md">
            <h1 class="text-3xl font-bold mb-2 dark:text-white">{{ book.title }}</h1>
            <p class="text-xl text-gray-700 dark:text-gray-300 mb-4">by {{ book.author }}</p>
            <div v-if="book.image_path"
                 class="mb-4">
                <img :src="book.image_path"
                     alt="Book Cover"
                     class="w-full max-h-96 object-contain rounded" />
            </div>
            <div class="prose max-w-none mb-2 dark:text-gray-300">
                <p class="whitespace-pre-wrap">{{ book.description }}</p>
            </div>
            <p v-if="book.created_at"
               class="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                {{ formatDate(book.created_at) }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Added by {{ book.user_username || book.user_email || 'ShelfSwap Member' }}
            </p>

            <div class="flex space-x-4 border-t pt-4">
                <template v-if="isOwner">
                    <router-link :to="`/books/${book.id}/edit`"
                                 class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Edit Book
                    </router-link>
                    <button @click="showDeleteModal = true"
                            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Delete Book
                    </button>
                </template>
                <template v-else-if="isAuthenticated">
                    <button @click="requestBook"
                            :disabled="requesting || book.is_requested"
                            :class="book.is_requested ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'"
                            class="text-white px-4 py-2 rounded disabled:opacity-50 transition-colors">
                        {{ requesting ? 'Processing...' : (book.is_requested ? 'Book requested' : 'Request Book') }}
                    </button>
                </template>
                <router-link to="/books"
                             class="text-gray-600 px-4 py-2 rounded hover:bg-gray-100 border">
                    Back to List
                </router-link>
            </div>
        </div>

        <ConfirmModal :isOpen="showDeleteModal"
                      message="Are you sure you want to delete this book? This action cannot be undone."
                      @confirm="confirmDelete"
                      @cancel="showDeleteModal = false" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useAuth } from '../stores/auth'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)
const requesting = ref(false)
const { user, isAuthenticated } = useAuth()
const { showToast } = useToast()

const isOwner = computed(() => {
    return book.value && user.value && book.value.user_id === user.value.id
})

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

const fetchBook = async () => {
    try {
        const res = await fetch(`/api/books/${route.params.id}`)
        if (!res.ok) {
            throw new Error('Failed to fetch book details')
        }
        book.value = await res.json()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

const confirmDelete = async () => {
    try {
        const res = await fetch(`/api/books/${book.value.id}`, { method: 'DELETE' })
        if (res.ok) {
            router.push('/books')
        } else {
            alert('Failed to delete book')
        }
    } catch (e) {
        alert('Error deleting book')
    } finally {
        showDeleteModal.value = false
    }
}

const requestBook = async () => {
    if (book.value.is_requested) return

    requesting.value = true
    try {
        const res = await fetch(`/api/books/${book.value.id}/request`, {
            method: 'POST'
        })
        if (res.ok) {
            showToast('Request sent successfully!', 'success')
            book.value.is_requested = true
        } else {
            const data = await res.json()
            showToast(data.error || 'Failed to send request', 'error')
        }
    } catch (e) {
        showToast('Error sending request', 'error')
    } finally {
        requesting.value = false
    }
}

onMounted(fetchBook)
</script>
