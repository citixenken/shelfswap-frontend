<template>
    <div class="relative isolate overflow-hidden px-4">
        <!-- Library hero background image (self-hosted, Pexels) -->
        <div class="hero-bg absolute inset-0"
             :style="{ backgroundImage: `url(${libraryHero})` }"
             aria-hidden="true">
        </div>
        <!-- Readability scrim that blends the photo into the page background -->
        <div class="hero-scrim absolute inset-0"
             aria-hidden="true"></div>

        <!-- Hero -->
        <section class="min-h-[65vh] flex flex-col items-center justify-center text-center py-16">
            <h1
                class="fade-in-up text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight max-w-4xl">
                Books shouldn't have a <span class="text-indigo-600 dark:text-indigo-400">shelf-life</span>.
            </h1>
            <p class="fade-in-up delay-200 mt-6 text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Swap the books you've finished for the ones you want to read next.
            </p>
            <div class="fade-in-up delay-400 mt-10 flex flex-col sm:flex-row gap-4">
                <router-link to="/books"
                             class="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-3.5 px-8 rounded-xl shadow-lg transition-colors">
                    Browse books
                </router-link>
                <router-link v-if="!isSignedIn"
                             to="/register"
                             class="border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 text-lg font-semibold py-3.5 px-8 rounded-xl transition-colors">
                    Join ShelfSwap
                </router-link>
            </div>
            <p v-if="stats.totalBooks > 0"
               class="fade-in-up delay-400 mt-8">
                <span
                      class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/70 dark:bg-gray-800/70 border border-emerald-200 dark:border-emerald-800 text-gray-700 dark:text-gray-300 shadow-sm">
                    <span class="relative flex h-2.5 w-2.5"
                          aria-hidden="true">
                        <span
                              class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none"></span>
                        <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    </span>
                    <span class="status-pulse">
                        {{ stats.totalBooks }} books shared · {{ stats.activeUsers }} readers · {{ stats.totalGenres }}
                        genres
                    </span>
                </span>
            </p>
        </section>

        <!-- How it works -->
        <section class="pb-16">
            <h2
                class="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-8">
                How it works</h2>
            <ol class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
                <li v-for="(step, i) in steps"
                    :key="step.title">
                    <div
                         class="mx-auto mb-3 w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                        {{ i + 1 }}</div>
                    <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ step.title }}</h3>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ step.text }}</p>
                </li>
            </ol>
        </section>

        <!-- Real covers recently listed -->
        <section v-if="carouselBooks.length"
                 class="pb-16 w-full max-w-5xl mx-auto">
            <h2
                class="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Fresh on the shelves</h2>
            <div class="cover-marquee relative w-full py-3">
                <div class="cover-marquee__track flex w-max">
                    <router-link v-for="(book, i) in carouselTrack"
                                 :key="`${book.id}-${i}`"
                                 :to="`/books/${book.id}`"
                                 :title="`${book.title} — ${book.author}`"
                                 :aria-hidden="i >= carouselBooks.length ? 'true' : undefined"
                                 :tabindex="i >= carouselBooks.length ? -1 : undefined"
                                 class="cover-marquee__item block w-24 sm:w-28 md:w-32 mr-3 sm:mr-4 md:mr-5 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-700 transition duration-200 hover:scale-105 hover:shadow-lg">
                        <AppImage :src="book.image_path"
                                  :alt="book.title"
                                  img-class="object-cover w-full h-full" />
                    </router-link>
                </div>
            </div>
        </section>

        <!-- Book of the Week — curated staff pick pulled from the promotions system -->
        <section v-if="bookOfWeek"
                 class="pb-16 w-full max-w-3xl mx-auto">
            <div
                 class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-indigo-100 dark:border-gray-700 overflow-hidden text-left">
                <div class="flex flex-col sm:flex-row">
                    <!-- Cover -->
                    <div class="sm:w-44 h-56 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                        <AppImage :src="bookOfWeek.image_path"
                                  alt=""
                                  img-class="object-cover w-full h-full" />
                    </div>
                    <!-- Details -->
                    <div class="p-6 flex flex-col flex-1">
                        <span
                              class="inline-flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200 mb-3">
                            📖 Book of the Week
                        </span>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ bookOfWeek.title }}</h3>
                        <p v-if="bookOfWeek.subtitle"
                           class="text-base text-gray-600 dark:text-gray-300 mt-1">{{ bookOfWeek.subtitle }}</p>
                        <p v-if="bookOfWeek.description"
                           class="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-4">{{ bookOfWeek.description
                            }}
                        </p>
                        <div class="mt-auto pt-5 flex flex-wrap items-center gap-3">
                            <a v-if="safeLink(bookOfWeek.link_url)"
                               :href="bookOfWeek.link_url"
                               target="_blank"
                               rel="noopener noreferrer"
                               @click="trackClick(bookOfWeek)"
                               class="inline-block px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
                                {{ bookOfWeek.cta_label || 'Learn more' }}
                            </a>
                            <router-link to="/books"
                                         class="inline-block px-5 py-2.5 rounded-lg border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors">
                                Browse the shelves
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@clerk/vue'
import API_BASE_URL from '../config/api'
import libraryHero from '../assets/library-hero.jpg'
import AppImage from '../components/AppImage.vue'

const { isSignedIn } = useAuth()

const steps = [
    { title: 'List', text: "Add the books you've finished reading." },
    { title: 'Request', text: 'Find a book you want and ask its owner.' },
    { title: 'Swap', text: 'Chat to arrange the handoff. Your old book finds a new reader.' }
]

// Curated "Book of the Week" staff pick, surfaced from the promotions system.
const bookOfWeek = ref(null)

const safeLink = (url) => !!url && /^https?:\/\//i.test(url)

const trackClick = (promo) => {
    if (!promo?.id) return
    // Fire-and-forget; never block on analytics.
    fetch(`${API_BASE_URL}/community/promotions/${promo.id}/click`, { method: 'POST' }).catch(() => { })
}

const loadBookOfWeek = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/community/promotions?type=staff_pick`)
        if (!res.ok) return
        const data = await res.json()
        bookOfWeek.value = Array.isArray(data) && data.length > 0 ? data[0] : null
    } catch (e) {
        console.error('Failed to fetch book of the week:', e)
    }
}

// Recently listed covers for the carousel.
const recentActivity = ref({ recent_books: [] })

// Only the 10 freshest covers cycle through the carousel.
const carouselBooks = computed(() => (recentActivity.value.recent_books || []).slice(0, 10))

// Duplicate the set so the CSS marquee loops seamlessly at translateX(-50%).
// When few covers exist we repeat the base set first so the track still fills
// the widest container (no visible gap mid-scroll).
const carouselTrack = computed(() => {
    const base = carouselBooks.value
    if (base.length === 0) return []
    const repeats = Math.max(1, Math.ceil(10 / base.length))
    const oneSet = []
    for (let r = 0; r < repeats; r++) oneSet.push(...base)
    return [...oneSet, ...oneSet]
})

const loadRecentActivity = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/activity/recent`)
        if (!res.ok) return
        const data = await res.json()
        recentActivity.value = {
            recent_books: Array.isArray(data.recent_books) ? data.recent_books : []
        }
    } catch (e) {
        console.error('Failed to fetch recent activity:', e)
    }
}

const stats = ref({
    totalBooks: 0,
    activeUsers: 0,
    totalGenres: 0
})

onMounted(async () => {
    loadBookOfWeek()
    loadRecentActivity()
    try {
        const res = await fetch(`${API_BASE_URL}/stats`)
        if (res.ok) {
            const data = await res.json()
            stats.value = {
                totalBooks: data.total_books || 0,
                activeUsers: data.active_users || 0,
                totalGenres: data.total_genres || 0
            }
        }
    } catch (e) {
        console.error('Failed to fetch stats:', e)
    }
})
</script>

<style scoped>
/* Library hero background image */
.hero-bg {
    z-index: -30;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    transform: scale(1.02);
    /* Promote to its own compositor layer so the ken-burns zoom repaints on
       the GPU instead of thrashing the main thread (smoother landing hero). */
    will-change: transform;
    /* slow, subtle ken-burns zoom keeps the hero feeling alive */
    animation: heroZoom 32s ease-in-out infinite alternate;
}

/* Tinted scrim keeps text readable and fades the photo into the page bg.
   Light mode fades into papayawhip (#ffefd5); dark mode into gray-900. */
.hero-scrim {
    z-index: -20;
    background: linear-gradient(to bottom,
            rgba(255, 239, 213, 0.62) 0%,
            rgba(255, 239, 213, 0.78) 28%,
            rgba(255, 239, 213, 0.90) 60%,
            rgba(255, 239, 213, 0.98) 85%,
            rgba(255, 239, 213, 1) 100%);
}

.dark .hero-scrim {
    background: linear-gradient(to bottom,
            rgba(17, 24, 39, 0.55) 0%,
            rgba(17, 24, 39, 0.74) 28%,
            rgba(17, 24, 39, 0.90) 60%,
            rgba(17, 24, 39, 0.98) 85%,
            rgba(17, 24, 39, 1) 100%);
}

@keyframes heroZoom {
    from {
        transform: scale(1.02);
    }

    to {
        transform: scale(1.12);
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

/* Gentle "live" pulse for the platform status line */
.status-pulse {
    animation: statusPulse 2.4s ease-in-out infinite;
}

@keyframes statusPulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

/* Fresh-on-the-shelves auto-scrolling cover carousel */
.cover-marquee {
    overflow: hidden;
    /* Fade the covers softly into the page at both edges */
    -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
    mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}

.cover-marquee__track {
    animation: coverMarquee 32s linear infinite;
    will-change: transform;
}

/* Pause so visitors can read titles / click a cover */
.cover-marquee:hover .cover-marquee__track {
    animation-play-state: paused;
}

@keyframes coverMarquee {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-50%);
    }
}

/* Respect users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
    .hero-bg {
        animation: none;
        transform: none;
    }

    .fade-in-up {
        animation: none;
        opacity: 1;
    }

    .status-pulse {
        animation: none;
    }

    /* Stop the auto-scroll and let users swipe through covers instead */
    .cover-marquee {
        overflow-x: auto;
    }

    .cover-marquee__track {
        animation: none;
    }
}
</style>
