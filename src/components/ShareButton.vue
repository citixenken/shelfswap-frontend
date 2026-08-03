<template>
    <div class="relative inline-block"
         ref="root">
        <button type="button"
                @click="onShareClick"
                class="inline-flex items-center gap-2 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24">
                <path stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z">
                </path>
            </svg>
            Share
        </button>

        <div v-if="menuOpen"
             class="absolute right-0 z-20 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
            <a :href="twitterUrl"
               target="_blank"
               rel="noopener noreferrer"
               @click="close"
               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">X
                / Twitter</a>
            <a :href="facebookUrl"
               target="_blank"
               rel="noopener noreferrer"
               @click="close"
               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Facebook</a>
            <a :href="whatsappUrl"
               target="_blank"
               rel="noopener noreferrer"
               @click="close"
               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">WhatsApp</a>
            <button type="button"
                    @click="copyLink"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Copy
                link</button>
            <a v-if="imageUrl"
               :href="imageUrl"
               target="_blank"
               rel="noopener noreferrer"
               @click="close"
               class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Share
                image</a>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '../composables/useToast'

const props = defineProps({
    title: { type: String, default: '' },
    url: { type: String, required: true },
    imageUrl: { type: String, default: '' }
})

const { showToast } = useToast()
const root = ref(null)
const menuOpen = ref(false)

const shareText = computed(() => {
    const t = (props.title || '').trim()
    return t ? `I'm swapping "${t}" on ShelfSwap` : `Check out this book on ShelfSwap`
})

const twitterUrl = computed(
    () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(props.url)}`
)
const facebookUrl = computed(
    () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`
)
const whatsappUrl = computed(
    () => `https://wa.me/?text=${encodeURIComponent(`${shareText.value} ${props.url}`)}`
)

const close = () => {
    menuOpen.value = false
}

// Prefer the native share sheet (mobile) when available; otherwise fall back to
// the dropdown of per-network links.
const onShareClick = async () => {
    if (navigator.share) {
        try {
            await navigator.share({ title: props.title || 'ShelfSwap', text: shareText.value, url: props.url })
            return
        } catch (e) {
            // User cancelled or share failed — fall back to the menu.
        }
    }
    menuOpen.value = !menuOpen.value
}

const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(props.url)
        showToast('Link copied to clipboard')
    } catch (e) {
        showToast('Could not copy link', 'error')
    }
    close()
}

const onDocClick = (e) => {
    if (menuOpen.value && root.value && !root.value.contains(e.target)) {
        close()
    }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
