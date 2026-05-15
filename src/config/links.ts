export const LINKS = {
  editor: 'https://scrollix.netlify.app/edit',
  framerReferral: 'https://framer.com/?via=scrollix'
} as const

export type LinkKey = keyof typeof LINKS
