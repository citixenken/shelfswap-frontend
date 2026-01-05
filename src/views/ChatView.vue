<template>
    <div class="container mx-auto p-4 h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4">
        <!-- Conversation List -->
        <div
             :class="['w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col', activeConversation ? 'hidden md:flex' : 'flex']">
            <div class="p-4 border-b dark:border-gray-700">
                <h2 class="text-xl font-bold dark:text-white">Messages</h2>
            </div>
            <div class="flex-grow overflow-y-auto">
                <!-- <div v-if="loadingConversations"
                     class="p-4 flex justify-center">
                    <svg class="animate-spin h-5 w-5 text-gray-500"
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24">
                        <circle class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"></circle>
                        <path class="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </div> -->
                <div v-if="conversations.length === 0"
                     class="p-4 text-center text-gray-500">No conversations yet</div>
                <div v-else>
                    <div v-for="conv in conversations"
                         :key="conv.id"
                         @click="selectConversation(conv)"
                         :class="['p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700', activeConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/30' : '']">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold dark:text-white">{{ conv.other_participant_name || 'User ' +
                                conv.other_participant_id }}</span>
                            <span class="text-xs text-gray-500">{{ formatTime(conv.last_message_at) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <p class="text-sm text-gray-600 dark:text-gray-300 truncate w-3/4">{{ conv.last_message ||
                                'No messages' }}</p>
                            <span v-if="conv.unread_count > 0"
                                  class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{{ conv.unread_count
                                }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Area -->
        <div
             :class="['w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col', !activeConversation ? 'hidden md:flex' : 'flex']">
            <div v-if="!activeConversation"
                 class="flex-grow flex items-center justify-center text-gray-400">
                Select a conversation to start chatting
            </div>
            <template v-else>
                <!-- Chat Header -->
                <div class="p-4 border-b dark:border-gray-700 flex items-center">
                    <button @click="activeConversation = null"
                            class="md:hidden mr-3 text-gray-500">
                        <svg class="w-6 h-6"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <h2 class="text-lg font-bold dark:text-white">{{ activeConversation.other_participant_name }}</h2>
                </div>

                <!-- Messages -->
                <div class="flex-grow overflow-y-auto p-4 space-y-4"
                     ref="messagesContainer">
                    <div v-if="loadingMessages"
                         class="text-center text-gray-500 mt-4">Loading messages...</div>
                    <div v-else-if="messages.length === 0"
                         class="text-center text-gray-500 mt-4">No messages available yet. Start the conversation!</div>
                    <div v-else
                         v-for="msg in messages"
                         :key="msg.id"
                         :class="['flex flex-col', msg.sender_id === user.id ? 'items-end' : 'items-start']">
                        <div
                             :class="['max-w-[75%] rounded-lg px-4 py-2', msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white']">
                            {{ msg.content }}
                        </div>
                        <span class="text-xs text-gray-400 mt-1">{{ formatTime(msg.created_at) }}</span>
                    </div>
                </div>

                <!-- Input -->
                <div class="p-4 border-t dark:border-gray-700">
                    <div class="flex gap-2">
                        <input v-model="newMessage"
                               @keydown.enter.prevent="sendMessage"
                               type="text"
                               placeholder="Type a message..."
                               class="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        <button type="button"
                                @click="sendMessage"
                                :disabled="!newMessage.trim()"
                                class="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50">
                            Send
                        </button>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router' // Import useRouter
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'

const { user, getToken } = useAuth()
const conversations = ref([])
const activeConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const loadingConversations = ref(true)
const loadingMessages = ref(false)
const messagesContainer = ref(null)
const route = useRoute()
const router = useRouter() // Initialize router
let pollInterval

const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })
}

const fetchConversations = async () => {
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            conversations.value = await res.json()
        }
    } catch (e) {
        console.error("Failed to fetch conversations", e)
    } finally {
        loadingConversations.value = false
    }
}

const fetchMessages = async (isPoll = false) => {
    if (!activeConversation.value) return
    if (!isPoll) loadingMessages.value = true
    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/conversations/${activeConversation.value.id}/messages?limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            const newMessages = await res.json()
            // Simple check if new messages arrived to scroll down
            const shouldScroll = messages.value.length < (newMessages || []).length
            messages.value = newMessages || []
            if (shouldScroll) scrollToBottom()
        }
    } catch (e) {
        console.error("Failed to fetch messages", e)
    } finally {
        if (!isPoll) loadingMessages.value = false
    }
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
    })
}

const selectConversation = (conv) => {
    activeConversation.value = conv
    // Immediately mark as read locally to update UI (optional, backend handles it on fetch)
    conv.unread_count = 0
    messages.value = []
    fetchMessages(false)
    scrollToBottom()
}

const sendMessage = async () => {
    if (!newMessage.value.trim() || !activeConversation.value) return
    const content = newMessage.value
    newMessage.value = '' // Optimistic clear

    try {
        const token = await getToken()
        const res = await fetch(`${API_BASE_URL}/conversations/${activeConversation.value.id}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        })
        if (res.ok) {
            const newMsg = await res.json()
            messages.value.push(newMsg)
            scrollToBottom()
            fetchConversations() // Refresh list for last message update
        } else {
            newMessage.value = content // Restore if failed
        }
    } catch (e) {
        newMessage.value = content
    }
}

onMounted(async () => {
    await fetchConversations()

    // Handle query param for deep linking ?id=...
    if (route.query.id) {
        const id = parseInt(route.query.id)
        const found = conversations.value.find(c => c.id === id)
        if (found) {
            selectConversation(found)
            // Clear query param so refresh doesn't stick
            router.replace({ query: null })
        }
    }

    pollInterval = setInterval(() => {
        fetchConversations()
        if (activeConversation.value) {
            fetchMessages(true)
        }
    }, 3000)
})

onUnmounted(() => {
    clearInterval(pollInterval)
})
</script>
