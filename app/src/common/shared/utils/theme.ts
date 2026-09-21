export type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'light')

  function apply(value: Theme) {
    theme.value = value
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', value === 'dark')
      localStorage.setItem('theme', value)
    }
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  if (import.meta.client && document.documentElement.classList.contains('dark') && theme.value !== 'dark') {
    theme.value = 'dark'
  }

  return { theme, toggle }
}
