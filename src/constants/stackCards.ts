import type { StackCardItem } from '@/types/navigation'

export const STACK_CARDS_CONTROL_LIMITS = {
  angleY: { min: -60, max: 60, step: 1 },
  angleX: { min: -60, max: 60, step: 1 },
  cardGap: { min: 0.6, max: 5, step: 0.1 },
  frontFadeWindow: { min: 0, max: 5, step: 0.1 },
  cardSize: { min: 0.7, max: 10, step: 0.1 },
  cardWidth: { min: 0.7, max: 2.2, step: 0.1 },
  wheelSensitivity: { min: 0.4, max: 4, step: 0.1 }
} as const
export const STACK_CARDS_AUTOPLAY_LIMITS = { min: 0.4, max: 8, step: 0.1 } as const

export const STACK_CARDS_CONTROLS = [
  { key: 'angleY', label: 'Y', ...STACK_CARDS_CONTROL_LIMITS.angleY },
  { key: 'angleX', label: 'X', ...STACK_CARDS_CONTROL_LIMITS.angleX },
  { key: 'cardGap', label: 'Distancia', ...STACK_CARDS_CONTROL_LIMITS.cardGap },
  { key: 'frontFadeWindow', label: 'Front fade', ...STACK_CARDS_CONTROL_LIMITS.frontFadeWindow },
  { key: 'cardSize', label: 'Tamano card', ...STACK_CARDS_CONTROL_LIMITS.cardSize },
  { key: 'cardWidth', label: 'Anchura card', ...STACK_CARDS_CONTROL_LIMITS.cardWidth },
  { key: 'wheelSensitivity', label: 'Sensibilidad', ...STACK_CARDS_CONTROL_LIMITS.wheelSensitivity }
] as const

export const STACK_CARDS_DEFAULT_CARDS: StackCardItem[] = [
  { title: 'Card 1', description: 'Description 1', color: '#0f172a' },
  { title: 'Card 2', description: 'Description 2', color: '#1d4ed8' },
  { title: 'Card 3', description: 'Description 3', color: '#0ea5e9' }
]

export const STACK_CARDS_DEFAULTS = {
  textSide: 'left' as const,
  angleY: -30,
  angleX: 0,
  cardGap: 1,
  frontFadeWindow: 0,
  cardSize: 1,
  cardWidth: 1,
  wheelSensitivity: 1,
  autoPlayEnabled: false,
  autoPlaySpeed: 1.6
} as const
