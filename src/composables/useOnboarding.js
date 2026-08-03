import { reactive } from 'vue'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'

// Shared onboarding-gate state. It starts "unlocked" so the UI never blocks a
// genuine member while the real status is loading or if the check fails — the
// backend still enforces the gate, this only drives the gating UI.
const state = reactive({
  loaded: false,
  unlocked: true,
  booksListed: 0,
  threshold: 3
})

export function useOnboarding() {
  const { getToken } = useAuth()

  const fetchStatus = async (force = false) => {
    if (state.loaded && !force) return state
    try {
      const token = await getToken()
      if (!token) return state
      const res = await fetch(`${API_BASE_URL}/onboarding`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        state.unlocked = !!data.unlocked
        state.booksListed = data.books_listed || 0
        state.threshold = data.threshold || 0
        state.loaded = true
      }
    } catch (e) {
      // Fail open: never block the UI on a status error.
      console.error('Failed to load onboarding status:', e)
    }
    return state
  }

  const remaining = () => Math.max(0, state.threshold - state.booksListed)

  return { state, fetchStatus, remaining }
}
