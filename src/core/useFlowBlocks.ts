import { computed, type Ref } from 'vue'
import { Direction, type Panel } from '../types/navigation'

const DEFAULT_DIRECTION: Direction = Direction.Down

const DIRECTION_VECTOR: Record<Direction, { x: number; y: number }> = {
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 }
}

export interface FlowBlockStep {
  index: number
  panel: Panel
  x: number
  y: number
  directionToNext: Direction
}

export function buildFlowBlocks(panels: Panel[]): FlowBlockStep[] {
  if (!panels.length) return []

  const steps: FlowBlockStep[] = []
  let x = 0
  let y = 0

  panels.forEach((panel, index) => {
    const directionToNext = (panel.nextPanelPosition ?? DEFAULT_DIRECTION) as Direction
    steps.push({
      index,
      panel,
      x,
      y,
      directionToNext
    })

    const vector = DIRECTION_VECTOR[directionToNext]
    x += vector.x
    y += vector.y
  })

  return steps
}

export function useFlowBlocks(panels: Ref<Panel[]>) {
  const flowSteps = computed<FlowBlockStep[]>(() => buildFlowBlocks(panels.value))
  return { flowSteps }
}
