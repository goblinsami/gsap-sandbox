import { computed, isRef, ref, watch, type Ref } from 'vue'
import type { ContentSchema, Panel } from '../types/navigation'
import { validateContentSchema } from '../utils/validateContent'
import { normalizeSnapEase, type SnapEaseOption } from '../constants/snapEase'
import { normalizeTransitionSpeed } from '../constants/transitionSpeed'
import { normalizeAutoPlaySpeed } from '../constants/autoPlaySpeed'
import { useFlowBlocks } from './useFlowBlocks'
import { useSlideSnapNavigation } from '../composables/useSlideSnapNavigation'

const EMPTY_SCHEMA: ContentSchema = { panels: [] }

interface UseStoryRuntimeOptions {
  enabled?: boolean | Ref<boolean>
  logPrefix?: string
}

export function useStoryRuntime(contentRef: Ref<ContentSchema | null>, options: UseStoryRuntimeOptions = {}) {
  const enabledRef = isRef(options.enabled) ? options.enabled : ref(options.enabled ?? true)
  const schemaRef = computed<ContentSchema>(() => contentRef.value ?? EMPTY_SCHEMA)
  const validation = computed(() => validateContentSchema(schemaRef.value))
  const isValid = computed(() => validation.value.ok)
  const validationErrors = computed(() => validation.value.errors)
  const navigationEnabled = computed(() => enabledRef.value && isValid.value)

  const autoSnapEnabled = ref(true)
  const loopEnabled = ref(false)
  const autoPlayEnabled = ref(false)
  const panelsState = ref<Panel[]>([])
  const snapEase = ref<SnapEaseOption>(normalizeSnapEase(undefined))
  const transitionSpeed = ref(normalizeTransitionSpeed(undefined))
  const autoPlaySpeed = ref(normalizeAutoPlaySpeed(undefined))

  watch(
    () => schemaRef.value,
    (schema) => {
      autoSnapEnabled.value = schema.autoSnapEnabled ?? true
      loopEnabled.value = schema.loopEnabled ?? false
      autoPlayEnabled.value = schema.autoPlayEnabled ?? false
      snapEase.value = normalizeSnapEase(schema.snapEase)
      transitionSpeed.value = normalizeTransitionSpeed(schema.transitionSpeed)
      autoPlaySpeed.value = normalizeAutoPlaySpeed(schema.autoPlaySpeed)

      if (!validateContentSchema(schema).ok) {
        panelsState.value = []
        return
      }
      panelsState.value = (schema.panels ?? []).map((panel) => ({ ...panel })) as Panel[]
    },
    { immediate: true }
  )

  const { flowSteps } = useFlowBlocks(panelsState)

  const { snapShellRef, snapStageRef, stepStyle, focusStep } = useSlideSnapNavigation({
    flowSteps,
    autoSnapEnabled,
    loopEnabled,
    snapEase,
    transitionSpeed,
    autoPlayEnabled,
    autoPlaySpeed,
    enabled: navigationEnabled,
    logPrefix: options.logPrefix
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

  const handleAutoSnapEnabledUpdate = (nextValue: boolean) => {
    autoSnapEnabled.value = nextValue
  }

  const handleTransitionSpeedUpdate = (nextValue: number) => {
    transitionSpeed.value = normalizeTransitionSpeed(nextValue)
  }

  const handleAutoPlayEnabledUpdate = (nextValue: boolean) => {
    autoPlayEnabled.value = nextValue
  }

  const handleAutoPlaySpeedUpdate = (nextValue: number) => {
    autoPlaySpeed.value = normalizeAutoPlaySpeed(nextValue)
  }

  return {
    autoSnapEnabled,
    autoPlayEnabled,
    autoPlaySpeed,
    flowSteps,
    isValid,
    loopEnabled,
    panelsState,
    snapEase,
    snapShellRef,
    snapStageRef,
    stepStyle,
    transitionSpeed,
    validationErrors,
    focusStep,
    handlePanelsUpdate,
    handleSnapEaseUpdate,
    handleLoopEnabledUpdate,
    handleAutoSnapEnabledUpdate,
    handleTransitionSpeedUpdate,
    handleAutoPlayEnabledUpdate,
    handleAutoPlaySpeedUpdate
  }
}
