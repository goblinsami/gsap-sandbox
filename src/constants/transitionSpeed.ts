export const DEFAULT_TRANSITION_SPEED = 1
export const MIN_TRANSITION_SPEED = 0.2
export const MAX_TRANSITION_SPEED = 3
export const TRANSITION_SPEED_STEP = 0.1

export const normalizeTransitionSpeed = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_TRANSITION_SPEED
  return Math.max(MIN_TRANSITION_SPEED, Math.min(MAX_TRANSITION_SPEED, value))
}
