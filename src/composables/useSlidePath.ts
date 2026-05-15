import type { Ref } from 'vue'
import type { Panel } from '../types/navigation'
import {
  buildFlowBlocks,
  useFlowBlocks,
  type FlowBlockStep
} from '../core/useFlowBlocks'

export type SlidePathStep = FlowBlockStep

export function buildSlidePath(panels: Panel[]) {
  return buildFlowBlocks(panels)
}

export function useSlidePath(panels: Ref<Panel[]>) {
  return useFlowBlocks(panels)
}
