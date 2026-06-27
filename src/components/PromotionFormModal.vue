<template>
    <div v-if="isOpen"
         class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="fixed inset-0 bg-gray-900/70 transition-opacity"
             @click="$emit('close')"></div>

        <div
             class="relative w-full max-w-lg my-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div
                 class="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 class="text-lg font-bold text-gray-800 dark:text-white">
                    {{ isEdit ? 'Edit Promotion' : 'New Promotion' }}
                </h3>
                <button @click="$emit('close')"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Close">
                    <svg class="w-6 h-6"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24">
                        <path stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form @submit.prevent="submit"
                  class="p-4 space-y-4">
                <!-- Type -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select v-model="form.type"
                            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                        <option v-for="opt in typeOptions"
                                :key="opt.value"
                                :value="opt.value">{{ opt.label }}</option>
                    </select>
                </div>

                <!-- Title -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span
                              class="text-red-500">*</span></label>
                    <input v-model="form.title"
                           type="text"
                           maxlength="200"
                           required
                           placeholder="e.g. Summer Author Signing — Jane Doe"
                           class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>

                <!-- Subtitle -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                    <input v-model="form.subtitle"
                           type="text"
                           maxlength="300"
                           placeholder="Short one-liner shown under the title"
                           class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>

                <!-- Description -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea v-model="form.description"
                              rows="3"
                              maxlength="2000"
                              placeholder="Details about the event, launch or offer"
                              class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"></textarea>
                </div>

                <!-- Sponsor + Location -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sponsor</label>
                        <input v-model="form.sponsor"
                               type="text"
                               maxlength="120"
                               placeholder="Advertiser / partner"
                               class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <input v-model="form.location"
                               type="text"
                               maxlength="160"
                               placeholder="City / venue (events)"
                               class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>

                <!-- Event date -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event date &
                        time</label>
                    <input v-model="form.event_date"
                           type="datetime-local"
                           class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>

                <!-- Link + CTA -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL</label>
                        <input v-model="form.link_url"
                               type="url"
                               maxlength="2048"
                               placeholder="https://..."
                               class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button
                            label</label>
                        <input v-model="form.cta_label"
                               type="text"
                               maxlength="40"
                               placeholder="Learn more"
                               class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                </div>

                <!-- Image -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                    <div class="flex items-center gap-3">
                        <div class="w-20 h-20 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            <AppImage :src="form.image_path"
                                      alt="Promotion image" />
                        </div>
                        <input type="file"
                               accept="image/*"
                               @change="handleFileUpload"
                               class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 hover:file:cursor-pointer" />
                    </div>
                    <p v-if="uploading"
                       class="text-xs text-gray-500 mt-1">Uploading image…</p>
                </div>

                <!-- Priority + Active -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                        <input v-model.number="form.priority"
                               type="number"
                               min="0"
                               max="1000"
                               class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        <p class="text-xs text-gray-400 mt-1">Higher shows first.</p>
                    </div>
                    <label class="flex items-center gap-2 pb-2 cursor-pointer">
                        <input v-model="form.is_active"
                               type="checkbox"
                               class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Active (visible)</span>
                    </label>
                </div>

                <!-- Scheduling (optional) -->
                <details class="border-t dark:border-gray-700 pt-3">
                    <summary class="text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                        Scheduling (optional)
                    </summary>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        <div>
                            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Starts</label>
                            <input v-model="form.starts_at"
                                   type="datetime-local"
                                   class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ends</label>
                            <input v-model="form.ends_at"
                                   type="datetime-local"
                                   class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>
                </details>

                <p v-if="error"
                   class="text-sm text-red-600">{{ error }}</p>

                <div class="flex justify-end gap-3 pt-2">
                    <button type="button"
                            @click="$emit('close')"
                            class="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="submit"
                            :disabled="saving || uploading"
                            :class="[
                                'px-4 py-2 rounded text-white transition-colors',
                                (saving || uploading) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            ]">
                        {{ saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create promotion') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'
import AppImage from './AppImage.vue'

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    promotion: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const { getToken } = useAuth()

const typeOptions = [
    { value: 'staff_pick', label: 'Staff pick / Book of the week' },
    { value: 'event', label: 'Event (fairs, signings, meetups)' },
    { value: 'launch', label: 'Book launch' },
    { value: 'ad', label: 'Sponsored ad' },
    { value: 'announcement', label: 'Announcement' }
]

const isEdit = computed(() => !!props.promotion?.id)

const emptyForm = () => ({
    type: 'event',
    title: '',
    subtitle: '',
    description: '',
    sponsor: '',
    location: '',
    event_date: '',
    link_url: '',
    cta_label: '',
    image_path: '',
    priority: 0,
    is_active: true,
    starts_at: '',
    ends_at: ''
})

const form = ref(emptyForm())
const selectedFile = ref(null)
const uploading = ref(false)
const saving = ref(false)
const error = ref('')

// Convert an ISO timestamp to the value a datetime-local input expects.
const toDatetimeLocal = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Convert a datetime-local value back to an ISO string (or null when empty).
const fromDatetimeLocal = (val) => {
    if (!val) return null
    const d = new Date(val)
    if (isNaN(d.getTime())) return null
    return d.toISOString()
}

// Re-seed the form whenever the modal opens or the target promotion changes.
watch(
    () => [props.isOpen, props.promotion],
    () => {
        if (!props.isOpen) return
        error.value = ''
        selectedFile.value = null
        if (props.promotion) {
            const p = props.promotion
            form.value = {
                type: p.type || 'event',
                title: p.title || '',
                subtitle: p.subtitle || '',
                description: p.description || '',
                sponsor: p.sponsor || '',
                location: p.location || '',
                event_date: toDatetimeLocal(p.event_date),
                link_url: p.link_url || '',
                cta_label: p.cta_label || '',
                image_path: p.image_path || '',
                priority: p.priority || 0,
                is_active: p.is_active !== false,
                starts_at: toDatetimeLocal(p.starts_at),
                ends_at: toDatetimeLocal(p.ends_at)
            }
        } else {
            form.value = emptyForm()
        }
    },
    { immediate: true, deep: true }
)

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0] || null
}

const uploadImage = async () => {
    if (!selectedFile.value) return form.value.image_path
    uploading.value = true
    try {
        const fd = new FormData()
        fd.append('image', selectedFile.value)
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        })
        if (!res.ok) throw new Error('Image upload failed')
        const data = await res.json()
        return data.image_path
    } finally {
        uploading.value = false
    }
}

const submit = async () => {
    if (saving.value) return
    error.value = ''

    if (!form.value.title.trim()) {
        error.value = 'Title is required.'
        return
    }
    if (form.value.link_url && !/^https?:\/\//i.test(form.value.link_url.trim())) {
        error.value = 'Link must start with http:// or https://'
        return
    }

    saving.value = true
    try {
        let imagePath = form.value.image_path
        if (selectedFile.value) {
            imagePath = await uploadImage()
        }

        const payload = {
            type: form.value.type,
            title: form.value.title.trim(),
            subtitle: form.value.subtitle.trim(),
            description: form.value.description.trim(),
            sponsor: form.value.sponsor.trim(),
            location: form.value.location.trim(),
            event_date: fromDatetimeLocal(form.value.event_date),
            link_url: form.value.link_url.trim(),
            cta_label: form.value.cta_label.trim(),
            image_path: imagePath || '',
            priority: Number(form.value.priority) || 0,
            is_active: form.value.is_active,
            starts_at: fromDatetimeLocal(form.value.starts_at),
            ends_at: fromDatetimeLocal(form.value.ends_at)
        }

        const url = isEdit.value
            ? `${API_BASE_URL}/community/promotions/${props.promotion.id}`
            : `${API_BASE_URL}/community/promotions`
        const method = isEdit.value ? 'PUT' : 'POST'

        const token = await getToken()
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const msg = await res.text()
            throw new Error(msg || 'Failed to save promotion')
        }

        const saved = await res.json()
        emit('saved', saved)
    } catch (e) {
        error.value = e.message || 'Something went wrong.'
    } finally {
        saving.value = false
    }
}
</script>
