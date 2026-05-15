import { onMounted, ref } from 'vue'
import content from '../data/welcome.json'
import type { ContentSchema, Panel } from '../types/navigation'
import { validateContentSchema } from '../utils/validateContent'
import { applyWelcomeGradientsToContent } from '../utils/welcomeGradients'
import { useSlidePath } from './useSlidePath'
import { useSlideSnapNavigation } from './useSlideSnapNavigation'
import { SNAP_EASE_OPTIONS, normalizeSnapEase, type SnapEaseOption } from '../constants/snapEase'
import { normalizeTransitionSpeed } from '../constants/transitionSpeed'

const LOG_PREFIX = '[flow-snap]'

export function usePresentationFlow() {
  const validation = validateContentSchema(content)
  const isValid = validation.ok
  const schema = applyWelcomeGradientsToContent(content as ContentSchema)
  const autoSnapEnabled = schema.autoSnapEnabled ?? true
  const loopEnabled = ref(schema.loopEnabled ?? false)
  const panelsState = ref<Panel[]>(isValid ? ((schema.panels ?? []).map((panel) => ({ ...panel })) as Panel[]) : [])
  const snapEase = ref<SnapEaseOption>(normalizeSnapEase(schema.snapEase))
  const transitionSpeed = ref(normalizeTransitionSpeed(schema.transitionSpeed))
  const { flowSteps } = useSlidePath(panelsState)

  const { snapShellRef, snapStageRef, stepStyle, focusStep } = useSlideSnapNavigation({
    flowSteps,
    autoSnapEnabled,
    loopEnabled,
    snapEase,
    transitionSpeed,
    enabled: isValid,
    logPrefix: LOG_PREFIX
  })

  const handlePanelsUpdate = (updated: Panel[]) => {
    panelsState.value = updated.map((panel) => ({ ...panel }))
  }

  const handleSnapEaseUpdate = (ease: string) => {
    snapEase.value = normalizeSnapEase(ease)
  }

  const handleLoopEnabledUpdate = (nextValue: boolean) => {
    loopEnabled.value = nextValue
  }

  const handleTransitionSpeedUpdate = (nextValue: number) => {
    transitionSpeed.value = normalizeTransitionSpeed(nextValue)
  }

  const handleFocusStep = (index: number) => {
    focusStep(index)
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
    loopEnabled,
    panelsState,
    snapEase,
    transitionSpeed,
    snapShellRef,
    snapStageRef,
    stepStyle,
    easeOptions: SNAP_EASE_OPTIONS,
    handlePanelsUpdate,
    handleSnapEaseUpdate,
    handleLoopEnabledUpdate,
    handleTransitionSpeedUpdate,
    handleFocusStep
  }
}

