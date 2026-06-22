<template>
    <div class="app-image"
         :class="wrapperClass">
        <!-- Skeleton placeholder shown while the image is loading -->
        <div v-show="status === 'loading' && src"
             class="app-image__skeleton"
             aria-hidden="true"></div>

        <!-- Actual image: fades in once fully loaded -->
        <img v-if="src && status !== 'error'"
             ref="imgRef"
             :src="src"
             :alt="alt"
             :loading="eager ? 'eager' : 'lazy'"
             :fetchpriority="eager ? 'high' : 'auto'"
             decoding="async"
             class="app-image__img"
             :class="[imgClass, { 'app-image__img--visible': status === 'loaded' }]"
             @load="onLoad"
             @error="onError" />

        <!-- Fallback shown when there is no image or it failed to load -->
        <div v-else
             class="app-image__fallback">
            <slot name="fallback">
                <svg class="app-image__icon"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg"
                     aria-hidden="true">
                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </slot>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
    // Image source URL. When empty, the fallback slot/icon is shown.
    src: {
        type: String,
        default: ''
    },
    alt: {
        type: String,
        default: ''
    },
    // Tailwind classes applied to the <img> (e.g. "object-cover" or "object-contain").
    imgClass: {
        type: String,
        default: 'object-cover'
    },
    // Tailwind classes applied to the wrapper (sizing, rounding, aspect-ratio, etc.).
    wrapperClass: {
        type: String,
        default: ''
    },
    // Eager-load above-the-fold images (skips lazy loading, raises fetch priority).
    eager: {
        type: Boolean,
        default: false
    }
})

const status = ref('loading') // 'loading' | 'loaded' | 'error'
const imgRef = ref(null)

const onLoad = () => {
    status.value = 'loaded'
}

const onError = () => {
    status.value = 'error'
}

// Cached images may already be complete before Vue attaches the load listener,
// so the load event never fires. Detect that case explicitly.
const syncFromCache = () => {
    const img = imgRef.value
    if (!img) return
    if (img.complete) {
        status.value = img.naturalWidth > 0 ? 'loaded' : 'error'
    }
}

onMounted(syncFromCache)

watch(() => props.src, () => {
    status.value = 'loading'
    nextTick(syncFromCache)
})
</script>

<style scoped>
.app-image {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* Base shimmer block */
.app-image__skeleton {
    position: absolute;
    inset: 0;
    background-color: #e5e7eb;
    /* gray-200 */
    overflow: hidden;
}

/* Moving highlight sweep */
.app-image__skeleton::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.55),
            transparent);
    animation: app-image-shimmer 1.5s infinite;
}

:global(.dark) .app-image__skeleton {
    background-color: #374151;
    /* gray-700 */
}

:global(.dark) .app-image__skeleton::after {
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent);
}

@keyframes app-image-shimmer {
    100% {
        transform: translateX(100%);
    }
}

.app-image__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.app-image__img--visible {
    opacity: 1;
}

.app-image__fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    /* gray-400 */
}

.app-image__icon {
    width: 33%;
    max-width: 2rem;
    height: auto;
}

/* Respect users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
    .app-image__skeleton::after {
        animation: none;
    }

    .app-image__img {
        transition: none;
    }
}
</style>
