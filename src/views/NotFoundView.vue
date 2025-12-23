<template>
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div class="mb-8 text-9xl animate-bounce">
            📖
        </div>
        <h1 class="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <h2 class="text-2xl md:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
            Page not found - get it?
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-8">
            Looks like this chapter hasn't been written yet, or maybe it was lost in the stacks.
        </p>

        <router-link to="/"
                     class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105">
            Return to the Library
        </router-link>
    </div>
</template>

<script setup>
// No script needed
</script>
