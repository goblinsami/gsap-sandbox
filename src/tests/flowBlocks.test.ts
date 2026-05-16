import { describe, expect, it } from 'vitest'
import { buildFlowBlocks } from '../core/useFlowBlocks'
import { Direction, type Panel } from '../types/navigation'

const panel = (id: string, nextPanelPosition?: Direction): Panel => ({
  id,
  title: id,
  eyebrow: id,
  panelClass: 'contrast',
  nextPanelPosition
})

describe('buildFlowBlocks', () => {
  it('returns empty array when there are no panels', () => {
    expect(buildFlowBlocks([])).toEqual([])
  })

  it('uses down as default direction when missing', () => {
    const steps = buildFlowBlocks([panel('1'), panel('2')])
    expect(steps[0].directionToNext).toBe(Direction.Down)
    expect(steps.map((step) => ({ x: step.x, y: step.y }))).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 }
    ])
  })

  it('computes mixed flow coordinates deterministically', () => {
    const steps = buildFlowBlocks([
      panel('1', Direction.Right),
      panel('2', Direction.Down),
      panel('3', Direction.Left),
      panel('4', Direction.Up),
      panel('5', Direction.Right)
    ])

    expect(steps.map((step) => ({ id: step.panel.id, x: step.x, y: step.y }))).toEqual([
      { id: '1', x: 0, y: 0 },
      { id: '2', x: 1, y: 0 },
      { id: '3', x: 1, y: 1 },
      { id: '4', x: 0, y: 1 },
      { id: '5', x: 0, y: 0 }
    ])
  })
})
