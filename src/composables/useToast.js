import { reactive } from 'vue'

const state = reactive({
  message: '',
  type: 'success', // 'success' or 'error'
  visible: false,
  timeout: null
})

export function useToast() {
  const showToast = (message, type = 'success') => {
    state.message = message
    state.type = type
    state.visible = true

    if (state.timeout) {
      clearTimeout(state.timeout)
    }

    state.timeout = setTimeout(() => {
      state.visible = false
    }, 3000)
  }

  return {
    state,
    showToast
  }
}
