<template>
    <transition name="slide-up">
        <div v-if="showBanner"
             class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t-2 border-indigo-500 z-50">
            <div class="container mx-auto px-4 py-4">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        <p class="mb-2">
                            <strong>🍪 We use cookies</strong>
                        </p>
                        <p>
                            We use cookies to enhance your browsing experience, serve personalized content, and analyze
                            our traffic.
                            By clicking "Accept All", you consent to our use of cookies.
                            <router-link to="/privacy"
                                         class="text-indigo-600 dark:text-indigo-400 hover:underline">
                                Learn more
                            </router-link>
                        </p>
                    </div>
                    <div class="flex gap-3 flex-shrink-0">
                        <button @click="acceptCookies"
                                class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Accept All
                        </button>
                        <button @click="rejectCookies"
                                class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg font-medium transition-colors">
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showBanner = ref(false)
const COOKIE_CONSENT_KEY = 'shelfswap_cookie_consent'

onMounted(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
        // Show banner after a short delay for better UX
        setTimeout(() => {
            showBanner.value = true
        }, 1000)
    }
})

const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    showBanner.value = false
}

const rejectCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    showBanner.value = false
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}
</style>
