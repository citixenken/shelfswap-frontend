import { ref, computed, watchEffect } from 'vue'
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/vue'
import API_BASE_URL from '../config/api'

const localUser = ref(null)
const fetchingUser = ref(false)
const lastFetchTime = ref(0)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useAuth = () => {
    const { isSignedIn, signOut } = useClerkAuth()
    const { user: clerkUser } = useClerkUser()

    // Fetch local user data from backend when Clerk user is available
    const fetchLocalUser = async (force = false) => {
        if (!clerkUser.value || fetchingUser.value) return

        // Check cache - don't refetch if data is fresh (unless forced)
        const now = Date.now()
        if (!force && localUser.value && (now - lastFetchTime.value) < CACHE_DURATION) {
            return
        }

        fetchingUser.value = true
        try {
            const res = await fetch(`${API_BASE_URL}/me`)
            if (res.ok) {
                localUser.value = await res.json()
                lastFetchTime.value = now
            }
        } catch (e) {
            console.error('Failed to fetch local user:', e)
        } finally {
            fetchingUser.value = false
        }
    }

    // Automatically fetch user data when Clerk user becomes available
    watchEffect(() => {
        if (clerkUser.value && !localUser.value && !fetchingUser.value) {
            fetchLocalUser()
        }
    })

    const user = computed(() => {
        // Use local user data if available (includes local DB ID)
        if (localUser.value) {
            return localUser.value
        }

        // Fallback to Clerk user data
        if (!clerkUser.value) return null
        return {
            id: clerkUser.value.id, // Clerk ID (fallback)
            email: clerkUser.value.primaryEmailAddress?.emailAddress,
            username: clerkUser.value.username || clerkUser.value.firstName,
            avatar_path: clerkUser.value.imageUrl
        }
    })

    const logout = async () => {
        localUser.value = null
        lastFetchTime.value = 0
        await signOut()
    }

    return {
        user,
        isAuthenticated: isSignedIn,
        logout,
        checkAuth: () => fetchLocalUser(true), // Force refresh when explicitly called
        login: async () => true, // Handled by Clerk UI
        register: async () => true, // Handled by Clerk UI
        updateProfile: async () => ({ success: false, error: 'Managed by Clerk' })
    }
}
