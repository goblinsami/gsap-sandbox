import { describe, expect, it } from 'vitest'
import { buildSlidePath } from '../composables/useSlidePath'
import { Direction, type Panel } from '../types/navigation'

const panel = (id: string, nextPanelPosition: Direction): Panel => ({
  id,
  title: id,
  eyebrow: id,
  panelClass: 'contrast',
  nextPanelPosition
})

describe('buildSlidePath', () => {
  it('builds square 2x2 path correctly', () => {
    const panels: Panel[] = [
      panel('panel-1', Direction.Right),
      panel('panel-2', Direction.Down),
      panel('panel-3', Direction.Left),
      panel('panel-4', Direction.Up)
    ]

    const steps = buildSlidePath(panels)

    expect(steps.map((s) => ({ id: s.panel.id, x: s.x, y: s.y, dir: s.directionToNext }))).toEqual([
      { id: 'panel-1', x: 0, y: 0, dir: Direction.Right },
      { id: 'panel-2', x: 1, y: 0, dir: Direction.Down },
      { id: 'panel-3', x: 1, y: 1, dir: Direction.Left },
      { id: 'panel-4', x: 0, y: 1, dir: Direction.Up }
    ])
  })

  it('builds vertical path correctly', () => {
    const panels: Panel[] = [
      panel('panel-1', Direction.Down),
      panel('panel-2', Direction.Down),
      panel('panel-3', Direction.Down),
      panel('panel-4', Direction.Down)
    ]

    const steps = buildSlidePath(panels)

    expect(steps.map((s) => ({ x: s.x, y: s.y }))).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 }
    ])
  })
})
