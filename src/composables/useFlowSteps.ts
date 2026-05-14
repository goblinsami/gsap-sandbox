import { computed, type Ref } from 'vue'
import type { Direction, Panel } from '../types/navigation'

const DEFAULT_DIRECTION: Direction = 'down'

const DIRECTION_VECTOR: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
}

export interface FlowStep {
  index: number
  panel: Panel
  x: number
  y: number
  directionToNext: Direction
}

export function buildFlowSteps(panels: Panel[]): FlowStep[] {
  if (!panels.length) return []

  const steps: FlowStep[] = []
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

export function useFlowSteps(panels: Ref<Panel[]>) {
  const flowSteps = computed<FlowStep[]>(() => buildFlowSteps(panels.value))
  return { flowSteps }
}
