import { reactive } from 'vue'

// Shared state for the "It's a Match!" celebration. A match can be triggered
// from two places: the HTTP response when the current user creates the matching
// request (BookDetailsView), or a real-time `match` SSE event when the other
// member completes the swap (App.vue).
const state = reactive({
  visible: false,
  match: null
})

export function useMatch() {
  const showMatch = (match) => {
    if (!match) return
    state.match = match
    state.visible = true
  }

  const hideMatch = () => {
    state.visible = false
    state.match = null
  }

  return {
    state,
    showMatch,
    hideMatch
  }
}
