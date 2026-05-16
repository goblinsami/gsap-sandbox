import { computed, ref, watch, type Ref } from 'vue'
import { ContentWidthMode, type Panel } from '@/types/navigation'
import { useGradientEditor } from './useGradientEditor'

type PanelKey = 'textContent' | 'ctas' | 'textStyle' | 'gradientEditor' | 'logoEditor'

interface UseSlidePropertiesModalControllerOptions {
  openRef: Ref<boolean>
  panelRef: Ref<Panel | null>
  draft: Panel
  save: () => void
  resetDraft: () => void
  emitClose: () => void
  emitSave: (panel: Panel) => void
  emitDelete: () => void
}

export function useSlidePropertiesModalController(options: UseSlidePropertiesModalControllerOptions) {
  const originalPanelSnapshot = ref<Panel | null>(null)

  const isContentWidthContained = computed(() => options.draft.contentWidthMode !== ContentWidthMode.Full)
  const onContentWidthModeToggle = (event: Event) => {
    const checked = (event.target as HTMLInputElement).checked
    options.draft.contentWidthMode = checked ? ContentWidthMode.Contained : ContentWidthMode.Full
    options.save()
  }

  const textGapValue = computed(() => Number(options.draft.eyebrowTitleGap ?? options.draft.titleDescriptionGap ?? 24))
  const onTextGapInput = (event: Event) => {
    const value = Number((event.target as HTMLInputElement).value)
    options.draft.eyebrowTitleGap = value
    options.draft.titleDescriptionGap = value
    options.save()
  }

  const isTextContentOpen = ref(false)
  const isCtasOpen = ref(false)
  const isTextStyleOpen = ref(false)
  const isGradientEditorOpen = ref(false)
  const isLogoEditorOpen = ref(false)

  const {
    gradientType,
    gradientOrientation,
    gradientColors,
    orientationOptions,
    buildGradient,
    syncFromGradient
  } = useGradientEditor(options.draft.backgroundGradient)

  const togglePanel = (key: PanelKey) => {
    if (key === 'textContent') isTextContentOpen.value = !isTextContentOpen.value
    if (key === 'ctas') isCtasOpen.value = !isCtasOpen.value
    if (key === 'textStyle') isTextStyleOpen.value = !isTextStyleOpen.value
    if (key === 'gradientEditor') isGradientEditorOpen.value = !isGradientEditorOpen.value
    if (key === 'logoEditor') isLogoEditorOpen.value = !isLogoEditorOpen.value
  }

  const applyGradient = () => {
    options.draft.backgroundGradient = buildGradient()
    options.save()
  }

  const clearGradient = () => {
    options.draft.backgroundGradient = undefined
    options.save()
  }

  const formatNumber = (value: number | undefined, digits: number) => Number(value ?? 0).toFixed(digits)

  const saveAndClose = () => {
    options.save()
    options.emitClose()
  }

  const cancelAndClose = () => {
    if (originalPanelSnapshot.value) {
      options.emitSave({ ...originalPanelSnapshot.value })
    } else {
      options.resetDraft()
    }
    options.emitClose()
  }

  const deleteAndClose = () => {
    options.emitDelete()
    options.emitClose()
  }

  watch(
    () => options.openRef.value,
    (isOpen, wasOpen) => {
      if (!isOpen || wasOpen || !options.panelRef.value) return
      originalPanelSnapshot.value = { ...options.panelRef.value }
      syncFromGradient(options.draft.backgroundGradient)
    }
  )

  watch(
    () => options.panelRef.value?.id,
    (nextId, prevId) => {
      if (!options.openRef.value || !nextId || nextId === prevId || !options.panelRef.value) return
      originalPanelSnapshot.value = { ...options.panelRef.value }
      syncFromGradient(options.draft.backgroundGradient)
    }
  )

  return {
    isContentWidthContained,
    onContentWidthModeToggle,
    textGapValue,
    onTextGapInput,
    isTextContentOpen,
    isCtasOpen,
    isTextStyleOpen,
    isGradientEditorOpen,
    isLogoEditorOpen,
    gradientType,
    gradientOrientation,
    gradientColors,
    orientationOptions,
    togglePanel,
    applyGradient,
    clearGradient,
    formatNumber,
    saveAndClose,
    cancelAndClose,
    deleteAndClose
  }
}
