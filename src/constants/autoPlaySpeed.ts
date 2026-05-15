export const DEFAULT_AUTOPLAY_SPEED = 4
export const MIN_AUTOPLAY_SPEED = 1
export const MAX_AUTOPLAY_SPEED = 12
export const AUTOPLAY_SPEED_STEP = 0.5

export const normalizeAutoPlaySpeed = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_AUTOPLAY_SPEED
  return Math.max(MIN_AUTOPLAY_SPEED, Math.min(MAX_AUTOPLAY_SPEED, value))
}
