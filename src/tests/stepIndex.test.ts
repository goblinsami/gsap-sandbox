import { describe, expect, it } from 'vitest'
import { clampStepIndex, normalizeStepIndex } from '../utils/stepIndex'

describe('step index helpers', () => {
  it('clamps index when loop is disabled', () => {
    expect(clampStepIndex(-1, 4)).toBe(0)
    expect(clampStepIndex(99, 4)).toBe(3)
    expect(normalizeStepIndex(-1, 4, false)).toBe(0)
    expect(normalizeStepIndex(4, 4, false)).toBe(3)
  })

  it('wraps index when loop is enabled', () => {
    expect(normalizeStepIndex(4, 4, true)).toBe(0)
    expect(normalizeStepIndex(5, 4, true)).toBe(1)
    expect(normalizeStepIndex(-1, 4, true)).toBe(3)
  })
})
