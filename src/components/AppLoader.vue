<template>
    <div class="app-loader"
         :class="{ 'app-loader--center': center }"
         role="status"
         aria-live="polite">
        <div class="app-loader__book"
             :style="{ fontSize }">
            <span class="app-loader__cover app-loader__cover--left"></span>
            <span class="app-loader__cover app-loader__cover--right"></span>
            <span class="app-loader__spine"></span>
            <span class="app-loader__page app-loader__page--1"></span>
            <span class="app-loader__page app-loader__page--2"></span>
            <span class="app-loader__page app-loader__page--3"></span>
        </div>
        <p v-if="label"
           class="app-loader__label">{{ label }}</p>
        <span class="app-loader__sr">{{ label || 'Loading' }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    // Visual size of the book: 'sm' (inline), 'md' (default), 'lg' (page hero).
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    // Optional caption shown beneath the book (also used for screen readers).
    label: {
        type: String,
        default: ''
    },
    // When true, fills the row and adds vertical padding for full-section loaders.
    center: {
        type: Boolean,
        default: false
    }
})

// Everything in the book scales from font-size, so size is the only knob.
const fontSize = computed(() => ({ sm: '12px', md: '20px', lg: '30px' }[props.size] || '20px'))
</script>

<style scoped>
.app-loader {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

/* Full-section loaders: fill the row and add breathing room. */
.app-loader--center {
    display: flex;
    width: 100%;
    padding: 2.75rem 0;
}

/* The open book. */
.app-loader__book {
    --ss-color: #4f46e5; /* indigo-600 */
    --ss-page: #ffffff;
    position: relative;
    width: 2.6em;
    height: 1.9em;
    perspective: 30em;
    transform-style: preserve-3d;
}

.app-loader__book * {
    box-sizing: border-box;
}

/* Static left/right covers */
.app-loader__cover {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1.3em;
    background: var(--ss-page);
    border: 0.13em solid var(--ss-color);
}

.app-loader__cover--left {
    left: 0;
    border-radius: 0.24em 0 0 0.24em;
    border-right-width: 0.065em;
}

.app-loader__cover--right {
    right: 0;
    border-radius: 0 0.24em 0.24em 0;
    border-left-width: 0.065em;
}

/* Center spine */
.app-loader__spine {
    position: absolute;
    left: 50%;
    top: -0.12em;
    bottom: -0.12em;
    width: 0.18em;
    transform: translateX(-50%);
    border-radius: 0.1em;
    background: var(--ss-color);
    z-index: 1;
}

/* Turning pages */
.app-loader__page {
    position: absolute;
    top: 0.05em;
    bottom: 0.05em;
    left: 50%;
    width: 1.2em;
    background: var(--ss-page);
    border: 0.13em solid var(--ss-color);
    border-radius: 0.06em 0.16em 0.16em 0.06em;
    transform-origin: left center;
    transform-style: preserve-3d;
    opacity: 0;
    z-index: 2;
    animation: app-loader-flip 1.8s ease-in-out infinite;
}

.app-loader__page--1 { animation-delay: 0s; }
.app-loader__page--2 { animation-delay: 0.6s; }
.app-loader__page--3 { animation-delay: 1.2s; }

@keyframes app-loader-flip {
    0% {
        transform: rotateY(0deg);
        opacity: 0;
    }

    8% {
        opacity: 1;
    }

    50% {
        transform: rotateY(-90deg);
        opacity: 1;
    }

    92% {
        opacity: 1;
    }

    100% {
        transform: rotateY(-180deg);
        opacity: 0;
    }
}

.app-loader__label {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: #6b7280; /* gray-500 */
}

/* Visually hidden, screen-reader-only text */
.app-loader__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Dark theme */
.dark .app-loader__book {
    --ss-color: #818cf8; /* indigo-400 */
    --ss-page: #1f2937; /* gray-800 */
}

.dark .app-loader__label {
    color: #9ca3af; /* gray-400 */
}

/* Respect users who prefer reduced motion: stop the flip, gently pulse instead. */
@media (prefers-reduced-motion: reduce) {
    .app-loader__page {
        animation: none;
        opacity: 0;
    }

    .app-loader__book {
        animation: app-loader-pulse 1.6s ease-in-out infinite;
    }
}

@keyframes app-loader-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
</style>
