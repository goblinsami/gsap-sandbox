export const clampStepIndex = (value: number, total: number) => {
  if (total <= 0) return 0
  return Math.max(0, Math.min(total - 1, value))
}

export const normalizeStepIndex = (value: number, total: number, loopEnabled: boolean) => {
  if (total <= 0) return 0
  if (!loopEnabled) return clampStepIndex(value, total)
  return ((value % total) + total) % total
}
