<template>
    <div class="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <!-- Animated background elements -->
        <div class="absolute inset-0 -z-10 overflow-hidden">
            <div class="floating-book absolute top-20 left-10 text-6xl opacity-10">📚</div>
            <div class="floating-book delay-1 absolute top-40 right-20 text-5xl opacity-10">📖</div>
            <div class="floating-book delay-2 absolute bottom-32 left-1/4 text-7xl opacity-10">📕</div>
            <div class="floating-book delay-3 absolute bottom-20 right-1/3 text-6xl opacity-10">📗</div>
        </div>

        <!-- Main heading with fade-in animation -->
        <div class="fade-in-up">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 dark:text-white leading-tight">
                Share Books. <br class="hidden md:inline" />
                <span class="text-gradient typing-animation">Build Community.</span>
            </h1>
        </div>

        <!-- Subheading with delayed fade-in -->
        <p class="fade-in-up delay-200 text-xl md:text-3xl text-gray-600 dark:text-gray-300 mb-10 font-light max-w-3xl">
            Your next great read is waiting on someone's shelf
        </p>

        <!-- Description with staggered fade-in -->
        <div
             class="fade-in-up delay-400 max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-400 leading-relaxed text-lg space-y-4">
            <p>
                That book you loved? Someone else is searching for it right now.
                That unread novel on your shelf? It could be someone's next obsession.
            </p>
            <p class="font-medium text-indigo-600 dark:text-indigo-400">
                ShelfSwap connects readers everywhere—share your collection, discover new stories, and keep books in
                circulation.
            </p>
        </div>

        <!-- Feature highlights with slide-in animation -->
        <div class="fade-in-up delay-600 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div
                 class="feature-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div class="text-4xl mb-3">📚</div>
                <h3 class="font-semibold text-lg mb-2 dark:text-white">Share Your Library</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">List books you're ready to share with the community
                </p>
            </div>
            <div
                 class="feature-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div class="text-4xl mb-3">🔍</div>
                <h3 class="font-semibold text-lg mb-2 dark:text-white">Discover Stories</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Browse books from readers around the world</p>
            </div>
            <div
                 class="feature-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div class="text-4xl mb-3">🔄</div>
                <h3 class="font-semibold text-lg mb-2 dark:text-white">Keep Books Moving</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Give stories a second life with fellow book lovers
                </p>
            </div>
        </div>

        <!-- CTA buttons with pulse animation -->
        <div class="fade-in-up delay-800 flex flex-col sm:flex-row gap-4">
            <router-link to="/books"
                         class="cta-button bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-xl transform transition hover:scale-105 duration-200">
                Explore Books
            </router-link>
            <router-link v-if="!isSignedIn"
                         to="/register"
                         class="cta-button-outline border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 text-lg font-semibold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105 duration-200">
                Join ShelfSwap
            </router-link>
        </div>

        <!-- Stats section -->
        <div class="fade-in-up delay-1000 mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 counter">{{ animatedStats.totalBooks
                }}+</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Books Shared</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 counter">{{
                    animatedStats.activeUsers }}+</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Readers</div>
            </div>
            <div>
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 counter">{{
                    animatedStats.totalGenres }}+
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Genres</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@clerk/vue'
import API_BASE_URL from '../config/api'

const { isSignedIn } = useAuth()

const stats = ref({
    totalBooks: 0,
    activeUsers: 0,
    totalGenres: 0
})

const animatedStats = ref({
    totalBooks: 0,
    activeUsers: 0,
    totalGenres: 0
})

// Animate counter from 0 to target value
const animateCounter = (key, target) => {
    const duration = 2000 // 2 seconds
    const steps = 60 // 60 frames
    const increment = target / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
        current += increment
        if (current >= target) {
            animatedStats.value[key] = target
            clearInterval(timer)
        } else {
            animatedStats.value[key] = Math.floor(current)
        }
    }, stepDuration)
}

onMounted(async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/stats`)
        if (res.ok) {
            const data = await res.json()
            // Map snake_case API response to camelCase
            stats.value = {
                totalBooks: data.total_books || 0,
                activeUsers: data.active_users || 0,
                totalGenres: data.total_genres || 0
            }

            // Trigger animations
            setTimeout(() => {
                animateCounter('totalBooks', stats.value.totalBooks)
                animateCounter('activeUsers', stats.value.activeUsers)
                animateCounter('totalGenres', stats.value.totalGenres)
            }, 1000) // Start animation after 1 second delay
        }
    } catch (e) {
        console.error('Failed to fetch stats:', e)
    }
})
</script>

<style scoped>
/* Gradient text animation */
.text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {

    0%,
    100% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }
}

/* Fade in up animation */
.fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
}

.fade-in-up.delay-200 {
    animation-delay: 0.2s;
}

.fade-in-up.delay-400 {
    animation-delay: 0.4s;
}

.fade-in-up.delay-600 {
    animation-delay: 0.6s;
}

.fade-in-up.delay-800 {
    animation-delay: 0.8s;
}

.fade-in-up.delay-1000 {
    animation-delay: 1s;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Floating book animation */
.floating-book {
    animation: float 6s ease-in-out infinite;
}

.floating-book.delay-1 {
    animation-delay: 1s;
}

.floating-book.delay-2 {
    animation-delay: 2s;
}

.floating-book.delay-3 {
    animation-delay: 3s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

/* Feature card hover effect */
.feature-card {
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

/* CTA button pulse */
.cta-button {
    position: relative;
    overflow: hidden;
}

.cta-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.cta-button:hover::before {
    width: 300px;
    height: 300px;
}

/* Counter animation */
.counter {
    animation: countUp 2s ease-out forwards;
}

@keyframes countUp {
    from {
        opacity: 0;
        transform: scale(0.5);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .floating-book {
        display: none;
    }
}
</style>
