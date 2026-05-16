import { describe, expect, it } from 'vitest'
import { normalizeTextSize } from '../utils/textSize'
import { TextSize } from '../types/navigation'

describe('normalizeTextSize', () => {
  it('normalizes valid values with spaces/casing', () => {
    expect(normalizeTextSize(' S ')).toBe(TextSize.Small)
    expect(normalizeTextSize('m')).toBe(TextSize.Medium)
    expect(normalizeTextSize('L')).toBe(TextSize.Large)
  })

  it('falls back to medium for invalid values', () => {
    expect(normalizeTextSize(undefined)).toBe(TextSize.Medium)
    expect(normalizeTextSize('xl')).toBe(TextSize.Medium)
    expect(normalizeTextSize(12)).toBe(TextSize.Medium)
  })

  it('allows custom fallback', () => {
    expect(normalizeTextSize('invalid', TextSize.Large)).toBe(TextSize.Large)
  })
})
