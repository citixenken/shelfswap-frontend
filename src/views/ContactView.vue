<template>
    <div class="container mx-auto p-4 max-w-2xl">
        <h1 class="text-3xl font-bold mb-6 dark:text-white text-center">Contact Us</h1>
        <div class="bg-white dark:bg-gray-800 p-6 rounded shadow-md">
            <form @submit.prevent="submitForm"
                  class="space-y-4">
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input v-model="form.name"
                           type="text"
                           required
                           class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input v-model="form.email"
                           type="email"
                           required
                           class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <input v-model="form.subject"
                           type="text"
                           required
                           class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                    <label class="block text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea v-model="form.message"
                              rows="5"
                              required
                              class="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <button type="submit"
                        :disabled="loading"
                        class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {{ loading ? 'Sending...' : 'Send Message' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import API_BASE_URL from '../config/api'

const router = useRouter()
const { showToast } = useToast()
const loading = ref(false)
const form = ref({
    name: '',
    email: '',
    subject: '',
    message: ''
})

const submitForm = async () => {
    loading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
        })

        if (res.ok) {
            showToast('Message sent successfully!', 'success')
            form.value = { name: '', email: '', subject: '', message: '' }
            router.push('/books')
        } else {
            const data = await res.json()
            showToast(data.error || 'Failed to send message', 'error')
        }
    } catch (e) {
        showToast('An error occurred', 'error')
    } finally {
        loading.value = false
    }
}
</script>
