import { computed, type Ref } from 'vue'
import type { Direction, HorizontalBlock, Panel, RenderBlock } from '../types/navigation'

function buildFlowBlocks(panels: Panel[]): RenderBlock[] {
  if (!panels.length) return []

  const result: RenderBlock[] = []
  let i = 0

  while (i < panels.length) {
    const current = panels[i]
    const currentDirection = (current.nextPanelPosition ?? 'down') as Direction

    if (currentDirection === 'left' || currentDirection === 'right') {
      const direction = currentDirection
      const horizontalPanels = [current]
      let j = i + 1

      if (j < panels.length) {
        horizontalPanels.push(panels[j])
      }

      while (j < panels.length - 1) {
        const nextDir = (panels[j].nextPanelPosition ?? 'down') as Direction
        if (nextDir !== direction) break
        j += 1
        horizontalPanels.push(panels[j])
      }

      const horizontalBlock: HorizontalBlock = {
        type: 'horizontal',
        panels: horizontalPanels,
        direction
      }

      result.push(horizontalBlock)
      i += horizontalPanels.length
      continue
    }

    result.push({ type: 'panel', panel: current, direction: currentDirection })
    i += 1
  }

  return result
}

function makeBlockKey(block: RenderBlock, index: number): string {
  if (block.type === 'panel') return `panel-${block.panel.id}-${index}`
  const ids = block.panels.map((p) => p.id).join('-')
  return `horizontal-${block.direction}-${ids}-${index}`
}

export function useFlowBlocks(panels: Ref<Panel[]>) {
  const blocks = computed<RenderBlock[]>(() => buildFlowBlocks(panels.value))
  return { blocks, makeBlockKey }
}

