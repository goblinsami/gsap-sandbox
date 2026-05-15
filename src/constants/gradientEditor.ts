export type GradientType = 'linear' | 'radial' | 'conic'

export const DEFAULT_GRADIENT_COLORS = ['#0b1024', '#1d3f8f', '#6a5cff', '#20d3ff'] as const
export const DEFAULT_GRADIENT_TYPE: GradientType = 'linear'
export const DEFAULT_GRADIENT_ORIENTATION = '135deg'

export const LINEAR_ORIENTATIONS = [
  { value: '90deg', label: 'Left to right' },
  { value: '180deg', label: 'Top to bottom' },
  { value: '270deg', label: 'Right to left' },
  { value: '0deg', label: 'Bottom to top' },
  { value: '135deg', label: 'Diagonal (↘)' },
  { value: '315deg', label: 'Diagonal (↖)' }
] as const

export const RADIAL_ORIENTATIONS = [
  { value: 'circle at center', label: 'Center' },
  { value: 'circle at top', label: 'Top' },
  { value: 'circle at bottom', label: 'Bottom' },
  { value: 'circle at left', label: 'Left' },
  { value: 'circle at right', label: 'Right' }
] as const

export const CONIC_ORIENTATIONS = [
  { value: 'from 0deg at center', label: '0° center' },
  { value: 'from 90deg at center', label: '90° center' },
  { value: 'from 180deg at center', label: '180° center' },
  { value: 'from 270deg at center', label: '270° center' }
] as const
