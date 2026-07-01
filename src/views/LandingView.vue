<template>
    <div
         class="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative isolate overflow-hidden">
        <!-- Library hero background image (self-hosted, Pexels) -->
        <div class="hero-bg absolute inset-0"
             :style="{ backgroundImage: `url(${libraryHero})` }"
             aria-hidden="true">
        </div>
        <!-- Readability scrim that blends the photo into the page background -->
        <div class="hero-scrim absolute inset-0"
             aria-hidden="true"></div>

        <!-- Animated background elements -->
        <div class="absolute inset-0 -z-10 overflow-hidden">
            <div class="floating-book absolute top-20 left-10 text-6xl opacity-10">📚</div>
            <div class="floating-book delay-1 absolute top-40 right-20 text-5xl opacity-10">📖</div>
            <div class="floating-book delay-2 absolute bottom-32 left-1/4 text-7xl opacity-10">📕</div>
            <div class="floating-book delay-3 absolute bottom-20 right-1/3 text-6xl opacity-10">📗</div>
        </div>

        <!-- Main heading with fade-in animation -->
        <div class="fade-in-up">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                Share what you've read. <br class="hidden md:inline" />
                <span class="text-indigo-600 dark:text-indigo-400">Swap for what's next.</span>
            </h1>
        </div>

        <!-- Subheading with delayed fade-in -->
        <p class="fade-in-up delay-200 text-xl md:text-3xl text-gray-600 dark:text-gray-300 mb-10 font-light max-w-3xl">
            A community for readers who pass books on instead of letting them gather dust.
        </p>

        <!-- Description with staggered fade-in -->
        <div
             class="fade-in-up delay-400 max-w-3xl mx-auto mb-12 text-gray-700 dark:text-gray-400 leading-relaxed text-lg space-y-4">
            <p>
                List the books you're ready to part with, browse what other members are
                offering, and message them directly to set up a swap.
            </p>
            <p class="font-medium text-indigo-600 dark:text-indigo-400">
                It's a simple way to find your next read and give your old favorites a new home.
            </p>
        </div>

        <!-- Feature highlights with slide-in animation -->
        <div class="fade-in-up delay-600 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <router-link to="/add"
                         class="feature-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 class="font-semibold text-lg mb-2 dark:text-white">1. List your books</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Add the titles you're ready to swap or lend to the
                    community.</p>
            </router-link>
            <router-link to="/books"
                         class="feature-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 class="font-semibold text-lg mb-2 dark:text-white">2. Browse the shelves</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">See what other members are offering and request what
                    you'd like to read.</p>
            </router-link>
            <router-link to="/members"
                         class="feature-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <h3 class="font-semibold text-lg mb-2 dark:text-white">3. Make the swap</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Chat to coordinate the handoff and keep good books
                    in
                    circulation.</p>
            </router-link>
        </div>

        <!-- CTA buttons with pulse animation -->
        <div class="fade-in-up delay-800 flex flex-col sm:flex-row gap-4">
            <router-link to="/books"
                         class="cta-button bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-4 px-10 rounded-full shadow-xl transform transition hover:scale-105 duration-200">
                Browse Books
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

        <!-- Live activity proof — real, recent momentum to build trust + FOMO -->
        <div v-if="hasActivity"
             class="fade-in-up delay-1000 mt-16 w-full max-w-5xl mx-auto">
            <div class="flex flex-col items-center gap-5">
                <!-- This-week momentum pills -->
                <div class="flex flex-wrap items-center justify-center gap-3">
                    <span v-if="recentActivity.swaps_this_week > 0"
                          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                        <span class="relative flex h-2.5 w-2.5">
                            <span
                                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        {{ recentActivity.swaps_this_week }} swap{{ recentActivity.swaps_this_week === 1 ? '' : 's' }}
                        this week
                    </span>
                    <span v-if="recentActivity.books_this_week > 0"
                          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                        📚 {{ recentActivity.books_this_week }} new book{{ recentActivity.books_this_week === 1 ? '' :
                            's'
                        }} this week
                    </span>
                </div>

                <!-- Wall of real covers — auto-scrolling carousel of the 6 freshest books -->
                <div v-if="carouselBooks.length"
                     class="w-full">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 text-center">Fresh on the
                        shelves</p>
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
                </div>
            </div>
        </div>

        <!-- Book of the Week — curated staff pick pulled from the promotions system -->
        <div v-if="bookOfWeek"
             class="fade-in-up delay-1000 mt-16 w-full max-w-3xl mx-auto">
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
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuth } from '@clerk/vue'
import API_BASE_URL from '../config/api'
import libraryHero from '../assets/library-hero.jpg'
import AppImage from '../components/AppImage.vue'

const { isSignedIn } = useAuth()

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

// Live-activity proof: recent covers + this-week momentum counts.
const recentActivity = ref({ recent_books: [], books_this_week: 0, swaps_this_week: 0 })

const hasActivity = computed(() => {
    const a = recentActivity.value
    return !!a && ((a.recent_books?.length || 0) > 0 || a.swaps_this_week > 0 || a.books_this_week > 0)
})

// Only the 6 freshest covers cycle through the carousel.
const carouselBooks = computed(() => (recentActivity.value.recent_books || []).slice(0, 6))

// Duplicate the set so the CSS marquee loops seamlessly at translateX(-50%).
// When few covers exist we repeat the base set first so the track still fills
// the widest container (no visible gap mid-scroll).
const carouselTrack = computed(() => {
    const base = carouselBooks.value
    if (base.length === 0) return []
    const repeats = Math.max(1, Math.ceil(6 / base.length))
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
            recent_books: Array.isArray(data.recent_books) ? data.recent_books : [],
            books_this_week: data.books_this_week || 0,
            swaps_this_week: data.swaps_this_week || 0
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

const animatedStats = ref({
    totalBooks: 0,
    activeUsers: 0,
    totalGenres: 0
})

// Frame-aligned counter animation. Using requestAnimationFrame (instead of
// setInterval) keeps the count-up in sync with the browser's paint cycle, so
// the hero stats settle smoothly without the micro-stutter a timer can cause.
const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const counterRafs = {}
let statsTimer = null

const animateCounter = (key, target) => {
    // Honor reduced-motion and skip the tween for empty/zero stats.
    if (prefersReducedMotion || target <= 0) {
        animatedStats.value[key] = target
        return
    }

    const duration = 2000 // 2 seconds
    const start = performance.now()

    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        // easeOutCubic gives a natural, decelerating settle.
        const eased = 1 - Math.pow(1 - progress, 3)
        animatedStats.value[key] = Math.floor(target * eased)

        if (progress < 1) {
            counterRafs[key] = requestAnimationFrame(step)
        } else {
            animatedStats.value[key] = target
        }
    }

    counterRafs[key] = requestAnimationFrame(step)
}

onMounted(async () => {
    loadBookOfWeek()
    loadRecentActivity()
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
            statsTimer = setTimeout(() => {
                animateCounter('totalBooks', stats.value.totalBooks)
                animateCounter('activeUsers', stats.value.activeUsers)
                animateCounter('totalGenres', stats.value.totalGenres)
            }, 1000) // Start animation after 1 second delay
        }
    } catch (e) {
        console.error('Failed to fetch stats:', e)
    }
})

// Cancel any in-flight animation frames / timers so counter work never
// continues after the user navigates away — keeps the next view stutter-free.
onUnmounted(() => {
    if (statsTimer) clearTimeout(statsTimer)
    Object.values(counterRafs).forEach((id) => cancelAnimationFrame(id))
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

/* Responsive adjustments */
@media (max-width: 768px) {
    .floating-book {
        display: none;
    }
}

/* Respect users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
    .hero-bg {
        animation: none;
        transform: none;
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
