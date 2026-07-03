<template>
    <section>
        <div class="flex items-center justify-between gap-4 mb-4">
            <h2 class="text-xl font-bold dark:text-white">{{ heading }}</h2>
        </div>

        <!-- Status tabs with counts -->
        <div class="flex flex-wrap gap-2 mb-4">
            <button v-for="tab in tabs"
                    :key="tab.value"
                    @click="activeTab = tab.value"
                    :class="activeTab === tab.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'"
                    class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors">
                {{ tab.label }}
                <span class="ml-1 opacity-70">{{ tab.count }}</span>
            </button>
        </div>

        <AppLoader v-if="loading"
                   center
                   label="Loading shelf…" />
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>

        <div v-else-if="visibleItems.length === 0"
             class="text-center text-gray-500 dark:text-gray-400 py-8">
            <template v-if="items.length === 0">
                Your shelf is empty.
                <router-link to="/books"
                             class="text-blue-500 hover:underline">Browse books</router-link>
                and add them to your shelf.
            </template>
            <template v-else>
                No books in this shelf yet.
            </template>
        </div>

        <div v-else
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in visibleItems"
                 :key="item.id"
                 class="bg-white dark:bg-gray-800 p-4 rounded shadow flex space-x-4">
                <router-link :to="`/books/${item.book_id}`"
                             class="w-20 h-28 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded overflow-hidden hover:opacity-90 transition-opacity">
                    <AppImage :src="item.book_image"
                              alt="Book Cover" />
                </router-link>
                <div class="flex flex-col justify-between min-w-0 flex-1">
                    <div>
                        <router-link :to="`/books/${item.book_id}`"
                                     class="block hover:underline">
                            <h3 class="text-lg font-bold dark:text-white line-clamp-1">{{ item.book_title }}</h3>
                        </router-link>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">by {{ item.book_author }}</p>
                        <span
                              class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              :class="shelfStatusBadge(item.status)">
                            {{ shelfStatusLabel(item.status) }}
                        </span>
                    </div>
                    <div v-if="editable"
                         class="mt-2">
                        <ShelfStatusSelector :model-value="item.status"
                                             :book-id="item.book_id"
                                             @changed="(status) => onItemChanged(item, status)" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppImage from './AppImage.vue'
import AppLoader from './AppLoader.vue'
import ShelfStatusSelector from './ShelfStatusSelector.vue'
import { SHELF_STATUSES, shelfStatusBadge, shelfStatusLabel, useShelf } from '../composables/useShelf'

const props = defineProps({
    heading: { type: String, default: 'My Shelf' },
    // When set, load another member's shelf (read-only). Omit for the caller's
    // own, editable shelf.
    userId: { type: [Number, String], default: null },
})

const { fetchShelf } = useShelf()

const items = ref([])
const loading = ref(true)
const error = ref('')
const activeTab = ref('all')

// The caller's own shelf is editable; another member's shelf is read-only.
const editable = computed(() => !props.userId)

const countFor = (status) => items.value.filter((i) => i.status === status).length

const tabs = computed(() => [
    { value: 'all', label: 'All', count: items.value.length },
    ...SHELF_STATUSES.map((s) => ({ value: s.value, label: s.label, count: countFor(s.value) })),
])

const visibleItems = computed(() => {
    if (activeTab.value === 'all') return items.value
    return items.value.filter((i) => i.status === activeTab.value)
})

// Reflect an inline status change without a full refetch: remove the item when
// it was taken off the shelf, otherwise update its status in place.
const onItemChanged = (item, status) => {
    if (status === '') {
        items.value = items.value.filter((i) => i.id !== item.id)
    } else {
        item.status = status
    }
}

const load = async () => {
    loading.value = true
    error.value = ''
    try {
        items.value = await fetchShelf(props.userId || undefined)
    } catch (e) {
        error.value = e.message || 'Failed to load shelf'
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>
