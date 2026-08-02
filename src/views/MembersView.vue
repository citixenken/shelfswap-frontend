<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">Community Members</h1>

        <!-- Search Input -->
        <div class="mb-6 max-w-md mx-auto">
            <div class="relative">
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search members by username..."
                    class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear search"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <p v-if="!loading && !error" class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {{ filteredMembers.length }} member{{ filteredMembers.length !== 1 ? 's' : '' }} found
            </p>
        </div>

        <AppLoader v-if="loading"
                   center
                   size="lg"
                   label="Loading members…" />
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else-if="filteredMembers.length === 0"
             class="text-center text-gray-500 dark:text-gray-400 mt-8">
            No members found matching "{{ searchQuery }}"
        </div>

        <div v-else
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="member in filteredMembers"
                 :key="member.id"
                 class="bg-white dark:bg-gray-800 p-6 rounded shadow flex flex-col">
                <div class="flex items-start gap-4">
                    <div
                         class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                        <AppImage :src="member.avatar_path"
                                  alt="Avatar">
                            <template #fallback>
                                <span class="text-2xl font-bold text-gray-500 dark:text-gray-300">
                                    {{ (member.username || member.email || 'U').charAt(0).toUpperCase() }}
                                </span>
                            </template>
                        </AppImage>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h2 class="text-lg font-bold dark:text-white break-words">{{ member.username || 'ShelfSwap Member' }}</h2>
<!--                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ maskEmail(member.email) }}</p>-->
                        <p class="text-sm text-gray-500 dark:text-gray-400 break-words">Joined: {{ formatDate(member?.created_at) }}</p>
                        <p v-if="member.location"
                           class="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-start gap-1">
                            <svg class="w-3 h-3 mt-0.5 flex-shrink-0"
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
                            <span class="break-words">{{ member.location }}</span>
                        </p>
                        <p v-if="member.bio"
                           class="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">{{ member.bio }}</p>
                    </div>
                </div>
                <div class="mt-auto pt-4 flex justify-end">
                    <button
                            @click="toggleFollow(member)"
                            :disabled="pendingIds.has(member.id)"
                            class="min-w-[6rem] px-4 py-1.5 text-sm font-medium text-center whitespace-nowrap rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            :class="isFollowing(member.id)
                                ? 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900/40 dark:hover:text-red-300'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                            :aria-label="isFollowing(member.id) ? `Unfollow ${member.username || 'member'}` : `Follow ${member.username || 'member'}`">
                        {{ isFollowing(member.id) ? 'Following' : 'Follow' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuth } from '../stores/auth'
import { useRoute } from 'vue-router'
import { onMounted, ref, reactive, watch, computed } from 'vue'
import API_BASE_URL from '../config/api'
import AppImage from '../components/AppImage.vue'
import AppLoader from '../components/AppLoader.vue'
import { useFollow } from '../composables/useFollow'
import { useToast } from '../composables/useToast'

const members = ref([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const { user, getToken } = useAuth()
const route = useRoute()
const { isFollowing, fetchFollowing, follow, unfollow } = useFollow()
const { showToast } = useToast()

// Tracks the members with an in-flight follow/unfollow request so their button
// can be disabled to prevent double submits.
const pendingIds = reactive(new Set())

// Computed property for filtered members based on search query
const filteredMembers = computed(() => {
    if (!searchQuery.value.trim()) {
        return members.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return members.value.filter(member => {
        const username = (member.username || '').toLowerCase()
        return username.includes(query)
    })
})

const fetchMembers = async () => {
    loading.value = true
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!res.ok) throw new Error('Failed to fetch members')
        const allMembers = await res.json()
        members.value = allMembers.filter(m => m.id !== user.value?.id)
        // Load who we already follow so the buttons render in the right state.
        try {
            await fetchFollowing(true)
        } catch (e) {
            // Non-critical: the list still renders, just without follow state.
            console.error('Failed to load following state:', e)
        }
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

// toggleFollow follows or unfollows a member, guarding against double clicks.
const toggleFollow = async (member) => {
    if (pendingIds.has(member.id)) return
    pendingIds.add(member.id)
    const name = member.username || 'member'
    try {
        if (isFollowing(member.id)) {
            await unfollow(member.id)
            showToast(`Unfollowed ${name}`)
        } else {
            await follow(member.id)
            showToast(`You're now following ${name}`)
        }
    } catch (e) {
        showToast(e.message || 'Something went wrong', 'error')
    } finally {
        pendingIds.delete(member.id)
    }
}

watch(user, () => {
    // Re-fetch or re-filter when user changes (e.g. loads)
    fetchMembers()
})

onMounted(fetchMembers)

const maskEmail = (email) => {
    if (!email) return ''
    const [local, domain] = email.split('@')
    if (!local || !domain) return email

    if (local.length <= 2) {
        return `${local.charAt(0)}***@${domain}`
    }
    return `${local.substring(0, 1)}***@${domain}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
