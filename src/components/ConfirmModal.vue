<template>
    <div v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cancel')"></div>

        <div class="relative w-full max-w-md p-4 mx-auto bg-white rounded-lg shadow-xl">
            <div class="p-6 text-center">
                <h3 class="mb-5 text-lg font-normal text-gray-500">{{ message }}</h3>
                <button @click="$emit('confirm')" type="button"
                    class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                    Yes, I'm sure
                </button>
                <button @click="$emit('cancel')" type="button"
                    class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10">
                    No, cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    message: {
        type: String,
        default: 'Are you sure you want to delete this item?'
    }
})
</script>
