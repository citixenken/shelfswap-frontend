<template>
    <div class="container mx-auto p-4">
        <AppLoader v-if="loading"
                   center
                   size="lg"
                   label="Loading book…" />
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>
        <div v-else-if="book"
             class="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow-md">
            <h1 class="text-3xl font-bold mb-2 dark:text-white">{{ book.title }}</h1>
            <p class="text-xl text-gray-700 dark:text-gray-300 mb-4">by {{ book.author }}</p>
            <div v-if="book.image_path"
                 class="mb-4 flex justify-center">
                <AppImage :src="book.image_path"
                          alt="Book Cover"
                          img-class="object-cover"
                          wrapper-class="w-full max-w-xs aspect-[2/3] rounded-lg shadow-md bg-gray-100 dark:bg-gray-700"
                          eager />
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

            <div v-if="isAuthenticated"
                 class="mt-4 flex items-center gap-3">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">My shelf:</span>
                <ShelfStatusSelector v-model="shelfStatus"
                                     :book-id="book.id" />
            </div>
        </div>

        <!-- Reviews & ratings -->
        <section v-if="book"
                 class="max-w-2xl mx-auto mt-6 bg-white dark:bg-gray-800 p-6 rounded shadow-md">
            <div class="flex items-center justify-between gap-4 mb-4">
                <h2 class="text-2xl font-bold dark:text-white">Reviews</h2>
                <div v-if="reviewCount > 0"
                     class="flex items-center gap-2">
                    <StarRating :model-value="averageRating"
                                readonly />
                    <span class="text-sm text-gray-600 dark:text-gray-300">
                        {{ averageRating.toFixed(1) }} · {{ reviewCount }} review{{ reviewCount === 1 ? '' : 's' }}
                    </span>
                </div>
            </div>

            <!-- Write / edit your review -->
            <div v-if="canReview"
                 class="mb-6 border-b dark:border-gray-700 pb-6">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ myReview ? 'Your review' : 'Write a review' }}
                </p>
                <StarRating v-model="myRating"
                            size="lg"
                            class="mb-3" />
                <textarea v-model="myBody"
                          rows="3"
                          maxlength="2000"
                          placeholder="Share what you thought about this book (optional)"
                          class="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"></textarea>
                <div class="flex items-center gap-3 mt-3">
                    <button @click="submitReview"
                            :disabled="submittingReview || myRating < 1"
                            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {{ submittingReview ? 'Saving…' : (myReview ? 'Update review' : 'Post review') }}
                    </button>
                    <button v-if="myReview"
                            @click="deleteReview"
                            :disabled="submittingReview"
                            class="text-red-600 dark:text-red-400 px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
            <p v-else-if="isOwner"
               class="text-sm text-gray-500 dark:text-gray-400 mb-6 italic">
                You can't review your own book.
            </p>
            <p v-else-if="!isAuthenticated"
               class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                <router-link to="/login"
                             class="text-indigo-600 dark:text-indigo-400 hover:underline">Sign in</router-link>
                to leave a review.
            </p>

            <!-- Reviews list -->
            <AppLoader v-if="reviewsLoading"
                       center
                       label="Loading reviews…" />
            <div v-else-if="reviewCount === 0"
                 class="text-sm text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to share your thoughts!
            </div>
            <ul v-else
                class="space-y-5">
                <li v-for="r in reviews"
                    :key="r.id"
                    class="flex gap-3">
                    <div
                         class="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                        <AppImage :src="r.user_avatar_path"
                                  alt="">
                            <template #fallback>
                                <span class="text-sm font-bold text-gray-500 dark:text-gray-300">
                                    {{ (r.user_username || 'M').charAt(0).toUpperCase() }}
                                </span>
                            </template>
                        </AppImage>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-medium text-gray-800 dark:text-gray-100">{{ r.user_username || 'ShelfSwap Member' }}</span>
                            <StarRating :model-value="r.rating"
                                        readonly
                                        size="sm" />
                            <span class="text-xs text-gray-400">{{ formatReviewDate(r.updated_at) }}</span>
                        </div>
                        <p v-if="r.body"
                           class="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">{{
                            r.body }}</p>
                    </div>
                </li>
            </ul>
        </section>

        <ConfirmModal :isOpen="showDeleteModal"
                      message="Are you sure you want to delete this book? This action cannot be undone."
                      @confirm="confirmDelete"
                      @cancel="showDeleteModal = false" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmModal from '../components/ConfirmModal.vue'
import AppImage from '../components/AppImage.vue'
import AppLoader from '../components/AppLoader.vue'
import StarRating from '../components/StarRating.vue'
import ShelfStatusSelector from '../components/ShelfStatusSelector.vue'
import { useAuth } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { useMatch } from '../composables/useMatch'
import API_BASE_URL from '../config/api'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteModal = ref(false)
const requesting = ref(false)
const shelfStatus = ref('')
const { user, isAuthenticated, getToken } = useAuth()
const { showToast } = useToast()
const { showMatch } = useMatch()

const isOwner = computed(() => {
    return book.value && user.value && book.value.user_id === user.value.id
})

// --- Reviews & ratings ---
const reviews = ref([])
const reviewsLoading = ref(false)
const myRating = ref(0)
const myBody = ref('')
const submittingReview = ref(false)

const reviewCount = computed(() => reviews.value.length)
const averageRating = computed(() => {
    if (!reviews.value.length) return 0
    const sum = reviews.value.reduce((acc, r) => acc + (r.rating || 0), 0)
    return sum / reviews.value.length
})
const myReview = computed(() => {
    if (!user.value) return null
    return reviews.value.find(r => r.user_id === user.value.id) || null
})
const canReview = computed(() => isAuthenticated.value && !isOwner.value)

// Prefill the form when an existing review is found. We intentionally don't
// reset on null so a member's in-progress first review isn't cleared.
watch(myReview, (r) => {
    if (r) {
        myRating.value = r.rating
        myBody.value = r.body || ''
    }
}, { immediate: true })

const formatReviewDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    })
}

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
        const headers = {}
        const token = await getToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch(`${API_BASE_URL}/books/${route.params.id}`, { headers })
        if (!res.ok) {
            throw new Error('Failed to fetch book details')
        }
        book.value = await res.json()
        shelfStatus.value = book.value?.shelf_status || ''
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

const confirmDelete = async () => {
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/books/${book.value.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
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
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/books/${book.value.id}/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (res.ok) {
            book.value.is_requested = true
            const data = await res.json().catch(() => ({}))

            // A mutual swap was detected — celebrate the match and let the user
            // jump into chat from the modal instead of auto-redirecting.
            if (data.match) {
                showMatch(data.match)
                return
            }

            showToast('Request sent successfully! Redirecting to chat...', 'success')

            // Initialize chat
            try {
                const convRes = await fetch(`${API_BASE_URL}/conversations`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ other_user_id: book.value.user_id })
                })
                if (convRes.ok) {
                    const { id } = await convRes.json()
                    router.push({ path: '/chats', query: { id } })
                }
            } catch (e) {
                console.error("Failed to redirect to chat", e)
            }
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

const fetchReviews = async () => {
    reviewsLoading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/books/${route.params.id}/reviews`)
        if (res.ok) {
            reviews.value = (await res.json()) || []
        }
    } catch (e) {
        console.error('Failed to load reviews', e)
    } finally {
        reviewsLoading.value = false
    }
}

const submitReview = async () => {
    if (myRating.value < 1) {
        showToast('Please select a rating', 'error')
        return
    }
    submittingReview.value = true
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/books/${route.params.id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating: myRating.value, body: myBody.value })
        })
        if (res.ok) {
            showToast(myReview.value ? 'Review updated' : 'Review posted', 'success')
            await fetchReviews()
        } else {
            const msg = (await res.text().catch(() => '')).trim()
            showToast(msg || 'Failed to save review', 'error')
        }
    } catch (e) {
        showToast('Error saving review', 'error')
    } finally {
        submittingReview.value = false
    }
}

const deleteReview = async () => {
    submittingReview.value = true
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/books/${route.params.id}/reviews`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            myRating.value = 0
            myBody.value = ''
            showToast('Review removed', 'success')
            await fetchReviews()
        } else {
            showToast('Failed to remove review', 'error')
        }
    } catch (e) {
        showToast('Error removing review', 'error')
    } finally {
        submittingReview.value = false
    }
}

onMounted(async () => {
    await fetchBook()
    fetchReviews()
})
</script>
