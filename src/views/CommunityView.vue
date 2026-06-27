<template>
    <div class="container mx-auto p-4">
        <!-- Header -->
        <div class="text-center mb-6">
            <h1 class="text-3xl font-bold dark:text-white">Community</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
                Events, new launches and what the world is reading right now.
            </p>
        </div>

        <!-- Admin toolbar -->
        <div v-if="isAdmin"
             class="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/20">
            <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Admin tools
            </span>
            <div class="flex gap-2">
                <button @click="openCreate"
                        class="px-3 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-700 text-white">
                    + New promotion
                </button>
                <button @click="toggleManager"
                        class="px-3 py-1.5 text-sm rounded border border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800">
                    {{ showManager ? 'Close manager' : 'Manage promotions' }}
                </button>
            </div>
        </div>

        <!-- Admin manager panel -->
        <div v-if="isAdmin && showManager"
             class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
            <div class="p-4 border-b dark:border-gray-700">
                <h2 class="font-bold text-gray-800 dark:text-white">All promotions</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">Impressions and clicks update as visitors browse
                    the page.</p>
            </div>
            <AppLoader v-if="loadingManager"
                       center
                       size="md"
                       class="py-6" />
            <div v-else-if="managerPromotions.length === 0"
                 class="p-6 text-center text-gray-500 dark:text-gray-400">
                No promotions yet. Create your first one to start engaging the community.
            </div>
            <div v-else
                 class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-left">
                        <tr>
                            <th class="p-3 font-medium">Title</th>
                            <th class="p-3 font-medium">Type</th>
                            <th class="p-3 font-medium">Status</th>
                            <th class="p-3 font-medium text-right">Impr.</th>
                            <th class="p-3 font-medium text-right">Clicks</th>
                            <th class="p-3 font-medium text-right">CTR</th>
                            <th class="p-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in managerPromotions"
                            :key="p.id"
                            class="border-t dark:border-gray-700">
                            <td class="p-3 text-gray-800 dark:text-gray-200 max-w-[16rem]">
                                <div class="font-medium truncate">{{ p.title }}</div>
                                <div v-if="p.sponsor"
                                     class="text-xs text-gray-400 truncate">by {{ p.sponsor }}</div>
                            </td>
                            <td class="p-3">
                                <span class="px-2 py-0.5 rounded-full text-xs"
                                      :class="typeMeta[p.type]?.class">
                                    {{ typeMeta[p.type]?.label || p.type }}
                                </span>
                            </td>
                            <td class="p-3">
                                <span :class="p.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'">
                                    {{ p.is_active ? 'Active' : 'Hidden' }}
                                </span>
                            </td>
                            <td class="p-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{{ p.impressions }}
                            </td>
                            <td class="p-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{{ p.clicks }}</td>
                            <td class="p-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{{ ctr(p) }}</td>
                            <td class="p-3 text-right whitespace-nowrap">
                                <button @click="openEdit(p)"
                                        class="text-indigo-600 dark:text-indigo-400 hover:underline mr-3">Edit</button>
                                <button @click="askDelete(p)"
                                        class="text-red-600 dark:text-red-400 hover:underline">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <AppLoader v-if="loadingHub"
                   center
                   size="lg"
                   label="Loading community…" />

        <template v-else>
            <!-- Announcements -->
            <div v-for="a in announcements"
                 :key="`ann-${a.id}`"
                 class="mb-4 rounded-lg px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-4">
                <div>
                    <p class="font-semibold text-blue-800 dark:text-blue-200">{{ a.title }}</p>
                    <p v-if="a.subtitle"
                       class="text-sm text-blue-700 dark:text-blue-300">{{ a.subtitle }}</p>
                </div>
                <a v-if="safeLink(a.link_url)"
                   :href="a.link_url"
                   target="_blank"
                   rel="noopener noreferrer"
                   @click="trackClick(a)"
                   class="text-sm font-medium text-blue-700 dark:text-blue-200 hover:underline whitespace-nowrap">
                    {{ a.cta_label || 'Learn more' }} →
                </a>
            </div>

            <!-- Featured hero -->
            <section v-if="featured"
                     class="mb-10">
                <div class="relative rounded-2xl overflow-hidden shadow-lg bg-gray-900 text-white min-h-[18rem] flex">
                    <div class="absolute inset-0">
                        <AppImage :src="featured.image_path"
                                  alt=""
                                  eager
                                  img-class="object-cover w-full h-full opacity-60" />
                    </div>
                    <div
                         class="relative z-10 p-6 sm:p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent w-full">
                        <span class="inline-block w-fit px-2 py-0.5 rounded-full text-xs mb-3"
                              :class="typeMeta[featured.type]?.class">
                            {{ typeMeta[featured.type]?.label || featured.type }}
                        </span>
                        <h2 class="text-2xl sm:text-4xl font-bold max-w-2xl">{{ featured.title }}</h2>
                        <p v-if="featured.subtitle"
                           class="mt-2 text-base sm:text-lg text-gray-200 max-w-2xl">{{ featured.subtitle }}</p>
                        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
                            <span v-if="featured.event_date">📅 {{ formatEventDate(featured.event_date) }}</span>
                            <span v-if="featured.location">📍 {{ featured.location }}</span>
                            <span v-if="featured.sponsor">Sponsored by {{ featured.sponsor }}</span>
                        </div>
                        <a v-if="safeLink(featured.link_url)"
                           :href="featured.link_url"
                           target="_blank"
                           rel="noopener noreferrer"
                           @click="trackClick(featured)"
                           class="mt-5 inline-block w-fit px-5 py-2.5 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors">
                            {{ featured.cta_label || 'Learn more' }}
                        </a>
                    </div>
                </div>
            </section>

            <!-- Promotion sections (events / launches / sponsored) -->
            <section v-for="section in sections"
                     :key="section.key"
                     class="mb-10">
                <h2 class="text-xl font-bold mb-4 dark:text-white">{{ section.title }}</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <article v-for="promo in section.items"
                             :key="promo.id"
                             class="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div class="h-40 bg-gray-100 dark:bg-gray-700">
                            <AppImage :src="promo.image_path"
                                      alt=""
                                      img-class="object-cover w-full h-full" />
                        </div>
                        <div class="p-4 flex flex-col flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="px-2 py-0.5 rounded-full text-xs"
                                      :class="typeMeta[promo.type]?.class">
                                    {{ typeMeta[promo.type]?.label || promo.type }}
                                </span>
                                <span v-if="promo.sponsor"
                                      class="text-xs text-gray-400 truncate">· {{ promo.sponsor }}</span>
                            </div>
                            <h3 class="font-semibold text-gray-900 dark:text-white line-clamp-2">{{ promo.title }}</h3>
                            <p v-if="promo.subtitle"
                               class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{{ promo.subtitle }}
                            </p>
                            <p v-if="promo.description"
                               class="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">{{ promo.description
                            }}
                            </p>
                            <div class="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                <p v-if="promo.event_date">📅 {{ formatEventDate(promo.event_date) }}</p>
                                <p v-if="promo.location">📍 {{ promo.location }}</p>
                            </div>
                            <div class="mt-auto pt-4 flex items-center justify-between">
                                <a v-if="safeLink(promo.link_url)"
                                   :href="promo.link_url"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   @click="trackClick(promo)"
                                   class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    {{ promo.cta_label || 'Learn more' }} →
                                </a>
                                <span v-else></span>
                                <div v-if="isAdmin"
                                     class="flex gap-2 text-xs">
                                    <button @click="openEdit(promo)"
                                            class="text-gray-500 hover:text-indigo-600">Edit</button>
                                    <button @click="askDelete(promo)"
                                            class="text-gray-500 hover:text-red-600">Delete</button>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <!-- NYT bestsellers -->
            <section v-if="bestsellers.length > 0"
                     class="mb-10">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 class="text-xl font-bold dark:text-white">NYT Bestsellers This Week</h2>
                        <p v-if="bestsellersUpdated"
                           class="text-xs text-gray-500 dark:text-gray-400">Updated {{ bestsellersUpdated }} · The New
                            York Times</p>
                    </div>
                    <div class="flex gap-2">
                        <button v-for="opt in nytLists"
                                :key="opt.value"
                                @click="selectNytList(opt.value)"
                                :class="[
                                    'px-3 py-1 text-sm rounded-full border transition-colors',
                                    nytList === opt.value
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                ]">
                            {{ opt.label }}
                        </button>
                    </div>
                </div>

                <AppLoader v-if="loadingBestsellers"
                           center
                           size="md"
                           class="py-6" />
                <div v-else
                     class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <a v-for="book in bestsellers"
                       :key="book.rank + book.title"
                       :href="safeLink(book.buy_url) ? book.buy_url : null"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="group block bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div class="relative h-48 bg-gray-100 dark:bg-gray-700">
                            <AppImage :src="book.image_url"
                                      alt=""
                                      img-class="object-cover w-full h-full" />
                            <span
                                  class="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">#{{
                                    book.rank }}</span>
                        </div>
                        <div class="p-3">
                            <h3
                                class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600">
                                {{ book.title }}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ book.author }}</p>
                        </div>
                    </a>
                </div>
            </section>

            <!-- Admin hint when NYT not configured -->
            <p v-if="isAdmin && !bestsellersConfigured"
               class="text-xs text-gray-400 dark:text-gray-500 mb-8">
                Tip: set the <code>NYT_API_KEY</code> backend environment variable to display live New York Times
                bestsellers here.
            </p>

            <!-- Empty state -->
            <div v-if="isEmptyHub"
                 class="text-center py-16">
                <p class="text-xl text-gray-600 dark:text-gray-300">The community hub is warming up.</p>
                <p class="text-gray-500 dark:text-gray-400 mt-2">
                    Check back soon for events, launches and bestseller picks.
                </p>
            </div>
        </template>

        <!-- Modals -->
        <PromotionFormModal :is-open="showForm"
                            :promotion="editing"
                            @close="showForm = false"
                            @saved="onSaved" />

        <ConfirmModal :is-open="!!deleting"
                      :message="`Delete “${deleting?.title || ''}”? This cannot be undone.`"
                      @confirm="confirmDelete"
                      @cancel="deleting = null" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../stores/auth'
import { useToast } from '../composables/useToast'
import API_BASE_URL from '../config/api'
import AppImage from '../components/AppImage.vue'
import AppLoader from '../components/AppLoader.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import PromotionFormModal from '../components/PromotionFormModal.vue'

const { user, getToken } = useAuth()
const { showToast } = useToast()

const isAdmin = computed(() => user.value?.is_admin === true)

// Hub state
const promotions = ref([])
const loadingHub = ref(true)

// NYT bestsellers state
const bestsellers = ref([])
const bestsellersUpdated = ref('')
const bestsellersConfigured = ref(true)
const loadingBestsellers = ref(false)
const nytList = ref('combined-print-and-e-book-fiction')
const nytLists = [
    { value: 'combined-print-and-e-book-fiction', label: 'Fiction' },
    { value: 'combined-print-and-e-book-nonfiction', label: 'Nonfiction' }
]

// Admin manager state
const showManager = ref(false)
const loadingManager = ref(false)
const managerPromotions = ref([])

// Modal state
const showForm = ref(false)
const editing = ref(null)
const deleting = ref(null)

const typeMeta = {
    staff_pick: { label: 'Staff Pick', class: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200' },
    event: { label: 'Event', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
    launch: { label: 'Launch', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' },
    ad: { label: 'Sponsored', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
    announcement: { label: 'News', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' }
}

const sectionDefs = [
    { key: 'staff_pick', title: 'Staff Picks' },
    { key: 'event', title: 'Upcoming Events' },
    { key: 'launch', title: 'New & Upcoming Launches' },
    { key: 'ad', title: 'Sponsored' }
]

const announcements = computed(() => promotions.value.filter((p) => p.type === 'announcement'))

// Highest-priority non-announcement promotion becomes the hero.
const featured = computed(() => promotions.value.find((p) => p.type !== 'announcement') || null)

const sections = computed(() =>
    sectionDefs
        .map((def) => ({
            ...def,
            items: promotions.value.filter((p) => p.type === def.key && p.id !== featured.value?.id)
        }))
        .filter((s) => s.items.length > 0)
)

const isEmptyHub = computed(
    () =>
        promotions.value.length === 0 &&
        bestsellers.value.length === 0 &&
        !loadingHub.value
)

const safeLink = (url) => !!url && /^https?:\/\//i.test(url)

const ctr = (p) => {
    if (!p.impressions) return '—'
    return ((p.clicks / p.impressions) * 100).toFixed(1) + '%'
}

const formatEventDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    return (
        d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
        ' · ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    )
}

const authHeaders = async () => {
    const token = await getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const loadPromotions = async () => {
    loadingHub.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/community/promotions`, { headers: await authHeaders() })
        if (!res.ok) throw new Error('Failed to load promotions')
        promotions.value = (await res.json()) || []
    } catch (e) {
        console.error('Failed to load promotions', e)
        promotions.value = []
    } finally {
        loadingHub.value = false
    }
}

const loadBestsellers = async () => {
    loadingBestsellers.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/community/bestsellers?list=${encodeURIComponent(nytList.value)}`)
        if (res.ok) {
            const data = await res.json()
            bestsellers.value = data.books || []
            bestsellersUpdated.value = data.updated || ''
            bestsellersConfigured.value = data.configured !== false
        }
    } catch (e) {
        console.error('Failed to load bestsellers', e)
    } finally {
        loadingBestsellers.value = false
    }
}

const selectNytList = (value) => {
    if (nytList.value === value) return
    nytList.value = value
    loadBestsellers()
}

const trackClick = (promo) => {
    if (!promo?.id) return
    // Fire-and-forget; never block navigation on analytics.
    fetch(`${API_BASE_URL}/community/promotions/${promo.id}/click`, { method: 'POST' }).catch(() => { })
}

// --- Admin actions ---
const loadManager = async () => {
    if (!isAdmin.value) return
    loadingManager.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/community/admin/promotions`, { headers: await authHeaders() })
        if (!res.ok) throw new Error('Failed to load promotions')
        managerPromotions.value = (await res.json()) || []
    } catch (e) {
        showToast('Could not load promotions', 'error')
    } finally {
        loadingManager.value = false
    }
}

const toggleManager = () => {
    showManager.value = !showManager.value
    if (showManager.value) loadManager()
}

const openCreate = () => {
    editing.value = null
    showForm.value = true
}

const openEdit = (promo) => {
    editing.value = promo
    showForm.value = true
}

const onSaved = async () => {
    showForm.value = false
    editing.value = null
    showToast('Promotion saved', 'success')
    await loadPromotions()
    if (showManager.value) await loadManager()
}

const askDelete = (promo) => {
    deleting.value = promo
}

const confirmDelete = async () => {
    const promo = deleting.value
    deleting.value = null
    if (!promo) return
    try {
        const res = await fetch(`${API_BASE_URL}/community/promotions/${promo.id}`, {
            method: 'DELETE',
            headers: await authHeaders()
        })
        if (!res.ok) throw new Error('Delete failed')
        showToast('Promotion deleted', 'success')
        await loadPromotions()
        if (showManager.value) await loadManager()
    } catch (e) {
        showToast('Could not delete promotion', 'error')
    }
}

onMounted(() => {
    loadPromotions()
    loadBestsellers()
})
</script>
