import { describe, expect, it } from 'vitest'
import { validateContentSchema } from '../utils/validateContent'

const panel = (id: string, nextPanelPosition: 'down' | 'right' | 'left' | 'up') => ({
  id,
  title: id,
  eyebrow: id,
  panelClass: 'contrast',
  nextPanelPosition
})

describe('validateContentSchema', () => {
  it('accepts valid square 2x2 content', () => {
    const content = {
      autoSnapEnabled: true,
      loopEnabled: true,
      panels: [
        panel('panel-1', 'right'),
        panel('panel-2', 'down'),
        panel('panel-3', 'left'),
        panel('panel-4', 'up')
      ]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('accepts valid vertical content', () => {
    const content = {
      autoSnapEnabled: true,
      loopEnabled: false,
      panels: [panel('panel-1', 'down'), panel('panel-2', 'down'), panel('panel-3', 'down')]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects invalid loopEnabled type', () => {
    const content = {
      loopEnabled: 'true',
      panels: [panel('panel-1', 'down')]
    }

    const result = validateContentSchema(content)
    expect(result.ok).toBe(false)
    expect(result.errors.some((e) => e.includes('loopEnabled debe ser boolean'))).toBe(true)
  })
})
