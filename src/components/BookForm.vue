<template>
    <div class="p-4 border rounded shadow-md bg-white max-w-md mx-auto mt-4">
        <h2 class="text-xl font-bold mb-4">{{ isEdit ? 'Edit Book' : 'Add a New Book' }}</h2>
        <form @submit.prevent="submitBook"
              class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Book Title</label>
                <input v-model="title"
                       type="text"
                       required
                       class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Book Author</label>
                <input v-model="author"
                       type="text"
                       required
                       class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Genre</label>
                <select v-model="genre"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="">Select a Genre</option>
                    <option v-for="g in genres"
                            :key="g"
                            :value="g">{{ g }}</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Brief synopsis of the book</label>
                <textarea v-model="description"
                          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          rows="3"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Cover Image</label>
                <input type="file"
                       @change="handleFileUpload"
                       accept="image/*"
                       class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 hover:file:cursor-pointer" />
            </div>
            <button type="submit"
                    :disabled="isSubmitting"
                    :class="[
                        'w-full text-white p-2 rounded transition-colors',
                        isSubmitting
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    ]">
                <span v-if="isSubmitting">
                    {{ isEdit ? 'Updating Book...' : 'Adding Book...' }}
                </span>
                <span v-else>
                    {{ isEdit ? 'Update Book' : 'Add Book' }}
                </span>
            </button>
        </form>
        <p v-if="message"
           class="mt-4 text-center text-sm"
           :class="isSuccess ? 'text-green-600' : 'text-red-600'">
            {{ message }}
        </p>
    </div>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
    initialBook: {
        type: Object,
        default: null
    },
    isEdit: {
        type: Boolean,
        default: false
    }
})

const router = useRouter()
const title = ref('')
const author = ref('')
const description = ref('')
const genre = ref('')
const imagePath = ref('')
const selectedFile = ref(null)
const message = ref('')
const isSuccess = ref(false)
const isSubmitting = ref(false)

const genres = [
    'Biography', 'Children\'s Literature', 'Comics', 'Contemporary Fiction', 'Fantasy',
    'Fiction', 'Historical Fiction', 'History', 'Horror', 'Humor',
    'Mystery', 'Non-Fiction', 'Religious', 'Romance', 'Romantasy',
    'Sci-Fi', 'Self-Help', 'Thriller', 'True Crime',
    'Young Adult', 'Other'
]

if (props.initialBook) {
    title.value = props.initialBook.title
    author.value = props.initialBook.author
    description.value = props.initialBook.description || ''
    genre.value = props.initialBook.genre || ''
    imagePath.value = props.initialBook.image_path || ''
}

watch(() => props.initialBook, (newVal) => {
    if (newVal) {
        title.value = newVal.title
        author.value = newVal.author
        description.value = newVal.description || ''
        genre.value = newVal.genre || ''
        imagePath.value = newVal.image_path || ''
    }
})

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0]
}

const uploadImage = async () => {
    if (!selectedFile.value) return null

    const formData = new FormData()
    formData.append('image', selectedFile.value)

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        return data.image_path
    } catch (e) {
        console.error(e)
        return null
    }
}

const submitBook = async () => {
    // Prevent multiple submissions
    if (isSubmitting.value) return

    isSubmitting.value = true
    message.value = ''

    try {
        let uploadedPath = imagePath.value
        if (selectedFile.value) {
            const path = await uploadImage()
            if (path) {
                uploadedPath = path
            }
        }

        const bookData = {
            title: title.value,
            author: author.value,
            description: description.value,
            genre: genre.value,
            image_path: uploadedPath
        }
        const url = props.isEdit ? `/api/books/${props.initialBook.id}` : '/api/books'
        const method = props.isEdit ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        })

        if (response.ok) {
            message.value = props.isEdit ? 'Book updated successfully!' : 'Book added successfully!'
            isSuccess.value = true

            // Show message for 1 second before redirecting
            setTimeout(() => {
                if (props.isEdit) {
                    // Redirect to the edited book's detail page
                    router.push(`/books/${props.initialBook.id}`)
                } else {
                    // Redirect to books list for new books
                    router.push('/books')
                }
            }, 1000)
        } else {
            message.value = 'Failed to save book.'
            isSuccess.value = false
            isSubmitting.value = false
        }
    } catch (error) {
        message.value = 'Error connecting to server.'
        isSuccess.value = false
        isSubmitting.value = false
    }
}
</script>
