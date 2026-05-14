import { onMounted, ref } from 'vue'
import content from '../data/content.json'
import type { ContentSchema, Panel } from '../types/navigation'
import { validateContentSchema } from '../utils/validateContent'
import { useSlidePath } from './useSlidePath'
import { useSlideSnapNavigation } from './useSlideSnapNavigation'
import { SNAP_EASE_OPTIONS, normalizeSnapEase, type SnapEaseOption } from '../constants/snapEase'

const LOG_PREFIX = '[flow-snap]'

export function usePresentationFlow() {
  const validation = validateContentSchema(content)
  const isValid = validation.ok
  const schema = content as ContentSchema
  const autoSnapEnabled = schema.autoSnapEnabled ?? true
  const loopEnabled = schema.loopEnabled ?? false
  const panelsState = ref<Panel[]>(isValid ? ((schema.panels ?? []).map((panel) => ({ ...panel })) as Panel[]) : [])
  const snapEase = ref<SnapEaseOption>(normalizeSnapEase(schema.snapEase))
  const { flowSteps } = useSlidePath(panelsState)

  const { snapShellRef, snapStageRef, stepStyle } = useSlideSnapNavigation({
    flowSteps,
    autoSnapEnabled,
    loopEnabled,
    snapEase,
    enabled: isValid,
    logPrefix: LOG_PREFIX
  })

  const handlePanelsUpdate = (updated: Panel[]) => {
    panelsState.value = updated.map((panel) => ({ ...panel }))
  }

  const handleSnapEaseUpdate = (ease: string) => {
    snapEase.value = normalizeSnapEase(ease)
  }

  onMounted(() => {
    console.log(`${LOG_PREFIX} mounted`)
    if (!isValid) {
      alert(`JSON invalido:\n\n${validation.errors.join('\n')}`)
    }
  })

  return {
    autoSnapEnabled,
    flowSteps,
    panelsState,
    snapEase,
    snapShellRef,
    snapStageRef,
    stepStyle,
    easeOptions: SNAP_EASE_OPTIONS,
    handlePanelsUpdate,
    handleSnapEaseUpdate
  }
}

