export const DEFAULT_SNAP_EASE = 'power3.inOut'

export const SNAP_EASE_OPTIONS = [
  'none',
  'power1.in',
  'power1.out',
  'power1.inOut',
  'power2.in',
  'power2.out',
  'power2.inOut',
  'power3.in',
  'power3.out',
  'power3.inOut',
  'power4.in',
  'power4.out',
  'power4.inOut',
  'sine.in',
  'sine.out',
  'sine.inOut',
  'circ.in',
  'circ.out',
  'circ.inOut',
  'expo.in',
  'expo.out',
  'expo.inOut',
  'back.in(1.7)',
  'back.out(1.7)',
  'back.inOut(1.7)',
  'bounce.in',
  'bounce.out',
  'bounce.inOut',
  'elastic.in(1,0.3)',
  'elastic.out(1,0.3)',
  'elastic.inOut(1,0.45)',
  'steps(4)',
  'steps(8)'
] as const

export type SnapEaseOption = (typeof SNAP_EASE_OPTIONS)[number]

export const normalizeSnapEase = (value?: string): SnapEaseOption =>
  SNAP_EASE_OPTIONS.includes(value as SnapEaseOption) ? (value as SnapEaseOption) : DEFAULT_SNAP_EASE
