<template>
    <select :value="modelValue"
            @change="onChange"
            :disabled="saving"
            :aria-label="'Reading shelf status'"
            class="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
        <option v-if="!modelValue"
                value=""
                disabled>{{ saving ? 'Saving…' : 'Add to shelf…' }}</option>
        <option v-for="s in SHELF_STATUSES"
                :key="s.value"
                :value="s.value">{{ s.label }}</option>
        <option v-if="modelValue"
                value="">Remove from shelf</option>
    </select>
</template>

<script setup>
import { ref } from 'vue'
import { SHELF_STATUSES, useShelf } from '../composables/useShelf'
import { useToast } from '../composables/useToast'

const props = defineProps({
    // Current shelf status ('' when the book is not shelved).
    modelValue: { type: String, default: '' },
    bookId: { type: [Number, String], required: true },
})
const emit = defineEmits(['update:modelValue', 'changed'])

const { setStatus, removeFromShelf } = useShelf()
const { showToast } = useToast()
const saving = ref(false)

const onChange = async (e) => {
    const next = e.target.value
    const prev = props.modelValue
    if (next === prev) return

    saving.value = true
    try {
        if (next === '') {
            await removeFromShelf(props.bookId)
            showToast('Removed from your shelf', 'success')
        } else {
            await setStatus(props.bookId, next)
            showToast('Shelf updated', 'success')
        }
        emit('update:modelValue', next)
        emit('changed', next)
    } catch (err) {
        showToast(err.message || 'Failed to update shelf', 'error')
        // Revert the <select> back to the previous status on failure.
        e.target.value = prev
    } finally {
        saving.value = false
    }
}
</script>
