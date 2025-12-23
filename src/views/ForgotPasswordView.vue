<template>
    <div class="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow-md">
        <h1 class="text-2xl font-bold mb-6 text-center dark:text-white">Forgot Password</h1>

        <div v-if="message"
             class="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {{ message }}
        </div>
        <div v-if="error"
             class="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {{ error }}
        </div>

        <form @submit.prevent="handleSubmit">
            <div class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                       for="email">
                    Email Address
                </label>
                <input v-model="email"
                       class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       id="email"
                       type="email"
                       required
                       placeholder="Enter your email">
            </div>

            <div class="flex items-center justify-between">
                <button :disabled="loading"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
                        type="submit">
                    {{ loading ? 'Sending...' : 'Send Reset Link' }}
                </button>
            </div>
        </form>

        <div class="mt-4 text-center">
            <router-link to="/login"
                         class="text-blue-500 hover:text-blue-700 text-sm">
                Back to Login
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

const handleSubmit = async () => {
    loading.value = true
    message.value = ''
    error.value = ''

    try {
        const res = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value })
        })

        const data = await res.json()

        if (res.ok) {
            message.value = data.message
            email.value = ''
        } else {
            error.value = data.error || 'Something went wrong'
        }
    } catch (e) {
        error.value = 'Network error'
    } finally {
        loading.value = false
    }
}
</script>
