<template>
    <div :class="[
        'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out',
        'md:static md:translate-x-0 md:shadow-none md:border-r dark:border-gray-700',
        isOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700 md:hidden">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Menu</h2>
            <button @click="$emit('close')"
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                <svg class="w-6 h-6"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <nav class="mt-4 text-center">
            <router-link to="/profile"
                         @click="$emit('close')"
                         class="block px-4 py-2 text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-blue-900">
                My Profile
            </router-link>
            <router-link to="/members"
                         @click="$emit('close')"
                         class="block px-4 py-2 text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-blue-900">
                Members
            </router-link>
            <router-link to="/wishlist"
                         @click="$emit('close')"
                         class="block px-4 py-2 text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-blue-900">
                Wishlist
            </router-link>
            <router-link to="/genres"
                         @click="$emit('close')"
                         class="block px-4 py-2 text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-blue-900">
                Genres
            </router-link>
            <router-link to="/community"
                         @click="$emit('close')"
                         class="block px-4 py-2 text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-blue-900">
                Community
            </router-link>
        </nav>
    </div>
    <!-- Overlay -->
    <div v-if="isOpen"
         @click="$emit('close')"
         class="fixed inset-0 z-20 bg-black opacity-50 md:hidden"></div>
</template>

<script setup>
defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})
defineEmits(['close'])
</script>
