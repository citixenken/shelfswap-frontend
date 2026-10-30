import { ref } from 'vue'
import API_BASE_URL from '../config/api'

// Module-level state so the sidebar updates immediately after an admin
// adds or deletes a link from the Community page.
const links = ref([])
const loading = ref(true)
let loaded = false

const fetchLinks = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/community/links`)
    if (res.ok) {
      links.value = (await res.json()) || []
      loaded = true
    }
  } catch (e) {
    console.error('Failed to fetch recommended reads', e)
  } finally {
    loading.value = false
  }
}

const ensureLoaded = () => (loaded ? Promise.resolve() : fetchLinks())

const readError = async (res, fallback) => {
  const text = (await res.text()).trim()
  return text || fallback
}

const addLink = async (payload, token) => {
  const res = await fetch(`${API_BASE_URL}/community/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await readError(res, 'Could not add link'))
  const created = await res.json()
  links.value = [created, ...links.value]
  return created
}

const deleteLink = async (id, token) => {
  const res = await fetch(`${API_BASE_URL}/community/links/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!res.ok && res.status !== 404) throw new Error(await readError(res, 'Could not delete link'))
  links.value = links.value.filter((l) => l.id !== id)
}

const safeLink = (url) => !!url && /^https?:\/\//i.test(url)

export function useTopReads() {
  return { links, loading, fetchLinks, ensureLoaded, addLink, deleteLink, safeLink }
}
