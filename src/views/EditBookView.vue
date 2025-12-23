<template>
    <div class="container mx-auto p-4">
        <!-- <h1 class="text-2xl font-bold text-center mb-6">Edit Book</h1> -->
        <div v-if="loading"
             class="text-center">Loading...</div>
        <div v-else-if="error"
             class="text-center text-red-600">{{ error }}</div>
        <BookForm v-else
                  :initialBook="book"
                  :isEdit="true" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BookForm from '../components/BookForm.vue'

const route = useRoute()
const book = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    try {
        const res = await fetch(`/api/books/${route.params.id}`)
        if (!res.ok) {
            throw new Error('Failed to fetch book')
        }
        book.value = await res.json()
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
})
</script>
