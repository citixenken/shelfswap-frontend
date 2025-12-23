import { ref, watch, onMounted } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'system')

export function useTheme() {
  const applyTheme = () => {
    const root = window.document.documentElement
    const isDark = theme.value === 'dark' ||
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  onMounted(() => {
    applyTheme()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
  })

  watch(theme, applyTheme)

  return {
    theme,
    setTheme
  }
}
