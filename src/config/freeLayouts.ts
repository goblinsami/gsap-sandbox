export const FREE_LAYOUTS = [
  'welcome',
  '4-per-side-loop',
  '5-horizontal-left',
  '5-horizontal-right',
  '5-vertical'
] as const

export type FreeLayout = (typeof FREE_LAYOUTS)[number]

