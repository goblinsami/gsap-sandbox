export const DEFAULT_PUBLIC_APP_URL = 'https://scrollix.netlify.app'

export const PUBLIC_APP_URL = (() => {
  const resolved = String(import.meta.env.VITE_PUBLIC_APP_URL ?? DEFAULT_PUBLIC_APP_URL).trim()
  return resolved || DEFAULT_PUBLIC_APP_URL
})()
