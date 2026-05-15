export const PREMIUM_LAYOUTS = [
  'story-map',
  'spiral',
  'circle-grid'
] as const

export type PremiumLayout = (typeof PREMIUM_LAYOUTS)[number]

