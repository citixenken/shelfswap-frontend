<template>
    <Transition name="match-pop">
        <div v-if="state.visible && state.match"
             class="fixed inset-0 z-50 flex items-center justify-center p-4"
             role="dialog"
             aria-modal="true"
             aria-labelledby="match-title">
            <div class="fixed inset-0 bg-gray-900/70 backdrop-blur-sm"
                 @click="hideMatch"></div>

            <div class="match-card relative w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
                <!-- Celebratory header -->
                <div class="bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 px-6 pt-8 pb-6 text-center text-white">
                    <p class="text-4xl mb-1"
                       aria-hidden="true">🎉</p>
                    <h2 id="match-title"
                        class="text-3xl font-extrabold tracking-tight">It's a Match!</h2>
                    <p class="mt-1 text-white/90">
                        You and {{ state.match.other_user_name }} both want each other's books.
                    </p>
                </div>

                <!-- Book covers -->
                <div class="px-6 py-6 flex items-stretch justify-center gap-3">
                    <div class="flex-1 text-center">
                        <p class="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-2">
                            You'll get
                        </p>
                        <AppImage :src="state.match.their_book_image"
                                  :alt="state.match.their_book_title"
                                  img-class="object-contain"
                                  wrapper-class="w-full aspect-[2/3] rounded-lg bg-gray-100 dark:bg-gray-700 mx-auto" />
                        <p class="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                            {{ state.match.their_book_title }}
                        </p>
                    </div>

                    <div class="flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                        <svg class="w-7 h-7"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24"
                             aria-hidden="true">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>

                    <div class="flex-1 text-center">
                        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2">
                            They'll get
                        </p>
                        <AppImage :src="state.match.your_book_image"
                                  :alt="state.match.your_book_title"
                                  img-class="object-contain"
                                  wrapper-class="w-full aspect-[2/3] rounded-lg bg-gray-100 dark:bg-gray-700 mx-auto" />
                        <p class="mt-2 text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                            {{ state.match.your_book_title }}
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="px-6 pb-6 flex flex-col gap-2">
                    <button @click="startChat"
                            :disabled="messaging"
                            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
                        {{ messaging ? 'Opening chat…' : `Message ${state.match.other_user_name}` }}
                    </button>
                    <button @click="hideMatch"
                            class="w-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium px-4 py-2 rounded-lg transition-colors">
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppImage from './AppImage.vue'
import { useMatch } from '../composables/useMatch'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'

const { state, hideMatch } = useMatch()
const { getToken } = useAuth()
const router = useRouter()
const messaging = ref(false)

const startChat = async () => {
    if (!state.match || messaging.value) return
    const otherUserId = state.match.other_user_id
    messaging.value = true
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ other_user_id: otherUserId })
        })
        hideMatch()
        if (res.ok) {
            const { id } = await res.json()
            router.push({ path: '/chats', query: { id } })
        } else {
            router.push('/chats')
        }
    } catch (e) {
        console.error('Failed to open chat from match', e)
        hideMatch()
        router.push('/chats')
    } finally {
        messaging.value = false
    }
}
</script>

<style scoped>
.match-pop-enter-active,
.match-pop-leave-active {
    transition: opacity 0.25s ease;
}

.match-pop-enter-from,
.match-pop-leave-to {
    opacity: 0;
}

.match-pop-enter-active .match-card {
    animation: match-card-in 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes match-card-in {
    0% {
        transform: scale(0.8) translateY(12px);
        opacity: 0;
    }

    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
