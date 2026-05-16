import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TEXT_SIZE,
  DESCRIPTION_FONT_SIZE_M_REM,
  EYEBROW_FONT_SIZE_M_REM,
  LOGO_BASE_SIZE_M,
  TEXT_SCALE_MULTIPLIER,
  TITLE_FONT_SIZE_M,
  getDescriptionClampSize,
  getDescriptionFontSizeRem,
  getEyebrowFontSizeRem,
  getLogoDimensions,
  getTextScale,
  getTitleClampSize
} from '../constants/slideStyle'
import { TextSize } from '../types/navigation'

describe('slideStyle size system', () => {
  it('uses medium as the default text size', () => {
    expect(DEFAULT_TEXT_SIZE).toBe(TextSize.Medium)
    expect(getTextScale(undefined)).toBe(1)
  })

  it('applies S/L as multipliers of M base sizes', () => {
    expect(TEXT_SCALE_MULTIPLIER[TextSize.Small]).toBeLessThan(TEXT_SCALE_MULTIPLIER[TextSize.Medium])
    expect(TEXT_SCALE_MULTIPLIER[TextSize.Large]).toBeGreaterThan(TEXT_SCALE_MULTIPLIER[TextSize.Medium])

    const eyebrowM = getEyebrowFontSizeRem(TextSize.Medium)
    const eyebrowS = getEyebrowFontSizeRem(TextSize.Small)
    const eyebrowL = getEyebrowFontSizeRem(TextSize.Large)

    expect(eyebrowM).toBe(EYEBROW_FONT_SIZE_M_REM)
    expect(eyebrowS).toBeCloseTo(EYEBROW_FONT_SIZE_M_REM * TEXT_SCALE_MULTIPLIER[TextSize.Small], 3)
    expect(eyebrowL).toBeCloseTo(EYEBROW_FONT_SIZE_M_REM * TEXT_SCALE_MULTIPLIER[TextSize.Large], 3)

    const descriptionM = getDescriptionFontSizeRem(TextSize.Medium)
    expect(descriptionM).toBe(DESCRIPTION_FONT_SIZE_M_REM)
  })

  it('builds clamp values for title and description based on multipliers', () => {
    const titleLarge = getTitleClampSize(TextSize.Large)
    const expectedTitleMin = TITLE_FONT_SIZE_M.minRem * TEXT_SCALE_MULTIPLIER[TextSize.Large]
    const expectedTitleVw = TITLE_FONT_SIZE_M.vw * TEXT_SCALE_MULTIPLIER[TextSize.Large]

    expect(titleLarge).toContain(`${expectedTitleMin}rem`)
    expect(titleLarge).toContain(`${expectedTitleVw}vw`)

    const descriptionSmall = getDescriptionClampSize(TextSize.Small)
    expect(descriptionSmall.startsWith('clamp(')).toBe(true)
    expect(descriptionSmall).toContain('vw')
  })

  it('scales logo dimensions from M base using same multipliers', () => {
    const logoM = getLogoDimensions(TextSize.Medium)
    const logoS = getLogoDimensions(TextSize.Small)
    const logoL = getLogoDimensions(TextSize.Large)

    expect(logoM).toEqual(LOGO_BASE_SIZE_M)
    expect(logoS.widthPx).toBe(Math.round(LOGO_BASE_SIZE_M.widthPx * TEXT_SCALE_MULTIPLIER[TextSize.Small]))
    expect(logoL.heightPx).toBe(Math.round(LOGO_BASE_SIZE_M.heightPx * TEXT_SCALE_MULTIPLIER[TextSize.Large]))
  })
})
