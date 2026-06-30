<template>
    <div class="inline-flex items-center"
         :class="readonly ? 'gap-0.5' : 'gap-1'"
         :role="readonly ? 'img' : undefined"
         :aria-label="readonly ? `Rated ${displayValue} out of 5` : undefined">
        <component :is="readonly ? 'span' : 'button'"
                   v-for="n in 5"
                   :key="n"
                   :type="readonly ? undefined : 'button'"
                   class="leading-none"
                   :class="readonly
                       ? 'inline-flex'
                       : 'inline-flex cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm'"
                   :aria-label="readonly ? undefined : `${n} star${n === 1 ? '' : 's'}`"
                   @click="select(n)"
                   @mouseenter="onHover(n)"
                   @mouseleave="onHover(0)">
            <svg :class="[sizeClass, n <= activeValue ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600']"
                 class="fill-current"
                 viewBox="0 0 20 20"
                 aria-hidden="true">
                <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.075 10.8c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        </component>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    // Current rating value (supports fractional averages for read-only display).
    modelValue: { type: Number, default: 0 },
    // Read-only renders inert <span>s so clicks bubble to a parent link.
    readonly: { type: Boolean, default: false },
    // 'sm' | 'md' | 'lg'
    size: { type: String, default: 'md' }
})
const emit = defineEmits(['update:modelValue'])

const hover = ref(0)

const displayValue = computed(() => Math.round((props.modelValue || 0) * 10) / 10)

// While hovering an interactive widget the hovered value previews; otherwise we
// round to the nearest whole star (averages read alongside the numeric value).
const activeValue = computed(() => {
    if (!props.readonly && hover.value > 0) return hover.value
    return Math.round(props.modelValue || 0)
})

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-4 h-4'
        case 'lg': return 'w-7 h-7'
        default: return 'w-5 h-5'
    }
})

const select = (n) => {
    if (props.readonly) return
    emit('update:modelValue', n)
}

const onHover = (n) => {
    if (props.readonly) return
    hover.value = n
}
</script>
