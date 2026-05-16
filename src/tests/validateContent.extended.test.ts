import { describe, expect, it } from 'vitest'
import { validateContentSchema } from '../utils/validateContent'

const panel = (id: string, nextPanelPosition: 'down' | 'right' | 'left' | 'up') => ({
  id,
  title: id,
  eyebrow: id,
  panelClass: 'contrast',
  nextPanelPosition
})

describe('validateContentSchema (extended)', () => {
  it('rejects duplicated panel ids', () => {
    const content = {
      panels: [panel('panel-1', 'down'), panel('panel-1', 'down')]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('id duplicado'))).toBe(true)
  })

  it('rejects opposite consecutive directions', () => {
    const content = {
      panels: [panel('panel-1', 'right'), panel('panel-2', 'left')]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('Regla de flujo'))).toBe(true)
  })

  it('accepts speed/intensity values on valid boundaries', () => {
    const content = {
      transitionSpeed: 0.2,
      autoPlaySpeed: 12,
      panels: [
        {
          ...panel('panel-1', 'down'),
          overlayIntensity: 0,
          contentMaxWidth: 480,
          titleMaxWidth: 220,
          descriptionMaxWidth: 320
        },
        {
          ...panel('panel-2', 'down'),
          overlayIntensity: 100,
          contentMaxWidth: 1600,
          titleMaxWidth: 1400,
          descriptionMaxWidth: 1500
        }
      ]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects CTA object with empty label or linkKey', () => {
    const content = {
      panels: [
        {
          ...panel('panel-1', 'down'),
          cta: {
            label: '',
            linkKey: ''
          }
        }
      ]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.includes('cta.label obligatorio'))).toBe(true)
    expect(result.errors.some((error) => error.includes('cta.linkKey obligatorio'))).toBe(true)
  })
})
