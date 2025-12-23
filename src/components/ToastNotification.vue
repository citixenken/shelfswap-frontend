<template>
    <div v-if="state.visible"
         class="fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white transition-opacity duration-300"
         :class="{
            'bg-green-500': state.type === 'success',
            'bg-red-500': state.type === 'error'
        }">
        {{ state.message }}
    </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { state } = useToast()
</script>
