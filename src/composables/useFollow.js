import { reactive } from 'vue'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'

// Shared reactive set of the current user's followee IDs so every view (members
// list, profile, feed) stays in sync the moment you follow or unfollow someone.
const state = reactive({
  followingIds: new Set(),
  loaded: false
})

// useFollow centralizes the follow-graph API calls and caches who the caller
// follows, mirroring how useShelf wraps the shelf endpoints.
export function useFollow() {
  const { getToken } = useAuth()

  const isFollowing = (userId) => state.followingIds.has(userId)

  // fetchFollowing loads the members the caller follows and caches their IDs.
  // Pass force to bypass the cache (e.g. after auth changes).
  const fetchFollowing = async (force = false) => {
    if (state.loaded && !force) return
    const token = await getToken()
    if (!token) return []
    const res = await fetch(`${API_BASE_URL}/follows`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load follows')
    const users = (await res.json()) || []
    state.followingIds = new Set(users.map((u) => u.id))
    state.loaded = true
    return users
  }

  // fetchFollowers loads the members who follow the caller (not cached).
  const fetchFollowers = async () => {
    const token = await getToken()
    if (!token) return []
    const res = await fetch(`${API_BASE_URL}/follows?type=followers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to load followers')
    return (await res.json()) || []
  }

  const follow = async (userId) => {
    const token = await getToken()
    const res = await fetch(`${API_BASE_URL}/follows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: userId })
    })
    if (!res.ok) {
      const msg = (await res.text().catch(() => '')).trim()
      throw new Error(msg || 'Failed to follow member')
    }
    state.followingIds.add(userId)
  }

  const unfollow = async (userId) => {
    const token = await getToken()
    const res = await fetch(`${API_BASE_URL}/follows?user_id=${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Failed to unfollow member')
    state.followingIds.delete(userId)
  }

  return { state, isFollowing, fetchFollowing, fetchFollowers, follow, unfollow }
}
