<template>
    <div class="container mx-auto p-4 max-w-3xl">
        <header class="mb-6 text-center">
            <h1 class="text-2xl font-bold dark:text-white">Activity Feed</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The latest listings, reviews, and swaps from the ShelfSwap community.
            </p>
        </header>

        <!-- Scope toggle: the whole community, or just people you follow. -->
        <div class="flex justify-center mb-6">
            <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                <button @click="setFilter('everyone')"
                        class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                        :class="feedFilter === 'everyone' ? activeTab : inactiveTab">
                    Everyone
                </button>
                <button @click="setFilter('following')"
                        class="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
                        :class="feedFilter === 'following' ? activeTab : inactiveTab">
                    Following
                </button>
            </div>
        </div>

        <AppLoader v-if="loading"
                   center
                   size="lg"
                   label="Loading activity…" />

        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else-if="items.length === 0"
             class="text-center text-gray-500 dark:text-gray-400 py-12">
            <template v-if="feedFilter === 'following'">
                No activity from people you follow yet.
                <router-link to="/members"
                             class="text-indigo-600 dark:text-indigo-400 hover:underline">Find members to
                    follow</router-link>.
            </template>
            <template v-else>
                No activity yet. Be the first to
                <router-link to="/add"
                             class="text-indigo-600 dark:text-indigo-400 hover:underline">list a book</router-link>!
            </template>
        </div>

        <ul v-else
            class="space-y-3">
            <li v-for="(item, i) in items"
                :key="`${item.type}-${item.book_id}-${item.actor_id}-${i}`"
                class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-start gap-3">
                <!-- Actor avatar (falls back to a colored initial when none) -->
                <div class="flex-shrink-0">
                    <AppImage v-if="item.actor_avatar"
                              :src="item.actor_avatar"
                              :alt="actorName(item)"
                              wrapper-class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
                              img-class="object-cover w-full h-full" />
                    <div v-else
                         class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                         :class="describe(item).avatarBg">
                        {{ actorInitial(item) }}
                    </div>
                </div>

                <!-- Event body -->
                <div class="flex-grow min-w-0">
                    <p class="text-sm text-gray-800 dark:text-gray-200">
                        <span class="font-semibold">{{ actorName(item) }}</span>
                        <span class="text-gray-600 dark:text-gray-400"> {{ describe(item).verb }}</span>
                    </p>

                    <!-- Book reference (shared across all event types) -->
                    <router-link :to="`/books/${item.book_id}`"
                                 class="mt-2 flex items-center gap-3 group">
                        <div class="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <AppImage :src="item.book_image"
                                      :alt="item.book_title"
                                      img-class="object-cover w-full h-full" />
                        </div>
                        <div class="min-w-0">
                            <p
                               class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                                {{ item.book_title }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ item.book_author }}</p>
                        </div>
                    </router-link>

                    <!-- Review specifics: stars + snippet -->
                    <div v-if="item.type === 'review_added'"
                         class="mt-2">
                        <StarRating :model-value="item.rating"
                                    readonly
                                    size="sm" />
                        <p v-if="item.body"
                           class="mt-1 text-sm text-gray-600 dark:text-gray-300 italic line-clamp-2">
                            &ldquo;{{ item.body }}&rdquo;</p>
                    </div>

                    <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span class="mr-1"
                              aria-hidden="true">{{ describe(item).icon }}</span>{{ timeAgo(item.created_at) }}
                    </p>
                </div>
            </li>
        </ul>

        <div v-if="!loading && !error && hasMore"
             class="text-center mt-6">
            <button @click="loadMore"
                    :disabled="loadingMore"
                    class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                {{ loadingMore ? 'Loading…' : 'Load more' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'
import AppImage from '../components/AppImage.vue'
import AppLoader from '../components/AppLoader.vue'
import StarRating from '../components/StarRating.vue'

const PAGE_SIZE = 20

const items = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const offset = ref(0)
const hasMore = ref(false)
const feedFilter = ref('everyone')
const { getToken } = useAuth()

// Tailwind class sets for the active / inactive scope-toggle tabs.
const activeTab = 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow'
const inactiveTab = 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'

const fetchFeed = async (append = false) => {
    try {
        const token = await getToken()
        const filterParam = feedFilter.value === 'following' ? '&filter=following' : ''
        const res = await fetch(`${API_BASE_URL}/feed?limit=${PAGE_SIZE}&offset=${offset.value}${filterParam}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to load activity feed')
        const data = await res.json()
        const batch = Array.isArray(data) ? data : []
        items.value = append ? items.value.concat(batch) : batch
        // A full page back implies there may be more to fetch.
        hasMore.value = batch.length === PAGE_SIZE
    } catch (e) {
        error.value = e.message
    }
}

// setFilter switches between the community-wide feed and the "Following" feed,
// resetting pagination and reloading from the top.
const setFilter = async (filter) => {
    if (feedFilter.value === filter) return
    feedFilter.value = filter
    offset.value = 0
    error.value = ''
    items.value = []
    loading.value = true
    await fetchFeed(false)
    loading.value = false
}

const loadMore = async () => {
    loadingMore.value = true
    offset.value += PAGE_SIZE
    await fetchFeed(true)
    loadingMore.value = false
}

onMounted(async () => {
    loading.value = true
    await fetchFeed(false)
    loading.value = false
})

const actorName = (item) => (item.actor_username && item.actor_username.trim()) || 'A member'
const actorInitial = (item) => actorName(item).charAt(0).toUpperCase()

// Per-event verb, icon, and fallback-avatar color.
const describe = (item) => {
    switch (item.type) {
        case 'book_listed':
            return { verb: ' listed a book for swap', icon: '📚', avatarBg: 'bg-indigo-500' }
        case 'review_added':
            return { verb: ' reviewed', icon: '⭐', avatarBg: 'bg-amber-500' }
        case 'swap_requested':
            return { verb: ' wants to swap for', icon: '🔄', avatarBg: 'bg-emerald-500' }
        default:
            return { verb: ' updated', icon: '•', avatarBg: 'bg-gray-500' }
    }
}

// Compact relative timestamp, falling back to an absolute date past ~a month.
const timeAgo = (dateStr) => {
    const then = new Date(dateStr).getTime()
    if (Number.isNaN(then)) return ''
    const seconds = Math.floor((Date.now() - then) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w ago`
    return new Date(then).toLocaleDateString()
}
</script>
