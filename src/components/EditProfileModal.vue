<template>
    <div v-if="isOpen"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 class="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2>
            <form @submit.prevent="handleSubmit">
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                           for="username">
                        Username
                    </label>
                    <input v-model="form.username"
                           id="username"
                           type="text"
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                           placeholder="Enter your username">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                           for="bio">
                        Bio
                    </label>
                    <textarea v-model="form.bio"
                              id="bio"
                              rows="3"
                              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="Tell us about yourself"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                           for="location">
                        Location
                    </label>
                    <input v-model="form.location"
                           id="location"
                           type="text"
                           class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                           placeholder="Enter your location">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                           for="avatar">
                        Avatar
                    </label>
                    <div class="flex items-center space-x-4">
                        <input @change="handleFileChange"
                               id="avatar"
                               type="file"
                               accept="image/*"
                               class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline">
                        <button v-if="user.avatar_path"
                                type="button"
                                @click="removeAvatar"
                                class="text-red-600 hover:text-red-800 text-sm font-bold">
                            Remove
                        </button>
                    </div>
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button"
                            @click="$emit('close')"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Cancel
                    </button>
                    <button type="submit"
                            :disabled="loading"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
                        {{ loading ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
    isOpen: Boolean,
    user: Object
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const form = reactive({
    username: '',
    bio: '',
    location: '',
    avatar: null,
    remove_avatar: false
})

watch(() => props.user, (newUser) => {
    if (newUser) {
        form.username = newUser.username || ''
        form.bio = newUser.bio || ''
        form.location = newUser.location || ''
        form.remove_avatar = false
    }
}, { immediate: true })

const handleFileChange = (e) => {
    form.avatar = e.target.files[0]
    form.remove_avatar = false
}

const removeAvatar = () => {
    form.avatar = null
    form.remove_avatar = true
}

const handleSubmit = async () => {
    loading.value = true
    try {
        await emit('save', { ...form })
    } finally {
        loading.value = false
    }
}
</script>
