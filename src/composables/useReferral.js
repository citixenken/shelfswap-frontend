import { reactive } from 'vue'
import { useAuth } from '../stores/auth'
import API_BASE_URL from '../config/api'

const REF_STORAGE_KEY = 'shelfswap_ref'

// Shared referral state: the caller's own code/link and how many friends they've
// referred.
const state = reactive({
  code: '',
  link: '',
  count: 0,
  loaded: false
})

export function useReferral() {
  const { getToken } = useAuth()

  // captureRefFromURL persists a ?ref= code so it survives the Clerk sign-up
  // redirect and can be claimed once the new member is authenticated.
  const captureRefFromURL = () => {
    try {
      const ref = (new URLSearchParams(window.location.search).get('ref') || '').trim()
      if (ref) localStorage.setItem(REF_STORAGE_KEY, ref)
    } catch (e) {
      /* localStorage/URL unavailable — ignore */
    }
  }

  // claimPendingReferral attributes the signed-in member to a stored referral
  // code. It clears the code after one attempt (a code is only claimed once) and
  // never throws, so it is safe to fire-and-forget after login.
  const claimPendingReferral = async () => {
    let ref = ''
    try {
      ref = (localStorage.getItem(REF_STORAGE_KEY) || '').trim()
    } catch (e) {
      return
    }
    if (!ref) return

    try {
      const token = await getToken()
      if (!token) return
      await fetch(`${API_BASE_URL}/referrals/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: ref })
      })
    } catch (e) {
      console.error('Failed to claim referral:', e)
    } finally {
      try {
        localStorage.removeItem(REF_STORAGE_KEY)
      } catch (e) {
        /* ignore */
      }
    }
  }

  const fetchMyReferral = async (force = false) => {
    if (state.loaded && !force) return state
    try {
      const token = await getToken()
      if (!token) return state
      const res = await fetch(`${API_BASE_URL}/referrals/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        state.code = data.code || ''
        state.link = data.link || ''
        state.count = data.count || 0
        state.loaded = true
      }
    } catch (e) {
      console.error('Failed to load referral info:', e)
    }
    return state
  }

  const sendInvites = async (emails) => {
    const token = await getToken()
    const res = await fetch(`${API_BASE_URL}/referrals/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ emails })
    })
    if (!res.ok) {
      const msg = (await res.text().catch(() => '')).trim()
      throw new Error(msg || 'Failed to send invites')
    }
    return res.json()
  }

  return { state, captureRefFromURL, claimPendingReferral, fetchMyReferral, sendInvites }
}
