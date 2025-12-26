<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6 dark:text-white">Community Members</h1>

        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="member in members"
                 :key="member.id"
                 class="bg-white dark:bg-gray-800 p-6 rounded shadow flex items-center space-x-4">
                <div
                     class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <img v-if="member.avatar_path"
                         :src="member.avatar_path"
                         alt="Avatar"
                         class="w-full h-full object-cover">
                    <span v-else
                          class="text-2xl font-bold text-gray-500 dark:text-gray-300">
                        {{ (member.username || member.email || 'U').charAt(0).toUpperCase() }}
                    </span>
                </div>
                <div>
                    <h2 class="text-lg font-bold dark:text-white">{{ member.username || 'ShelfSwap Member' }}</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ maskEmail(member.email) }}</p>
                    <p v-if="member.location"
                       class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        <svg class="w-3 h-3 inline mr-1"
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
                        {{ member.location }}
                    </p>
                    <p v-if="member.bio"
                       class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{{ member.bio }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuth } from '../stores/auth'
import { useRoute } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import API_BASE_URL from '../config/api'

const members = ref([])
const loading = ref(true)
const error = ref('')
const { user } = useAuth()
const route = useRoute()

const fetchMembers = async () => {
    loading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/members`)
        if (!res.ok) throw new Error('Failed to fetch members')
        const allMembers = await res.json()
        members.value = allMembers.filter(m => m.id !== user.value?.id)
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
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
    return `${local.substring(0, 2)}***@${domain}`
}
</script>
