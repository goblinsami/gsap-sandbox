import { computed, onMounted, ref, watch, type Ref } from 'vue'
import type { FlowEditorExposed } from '@/types/editor'
import type { Panel } from '@/types/navigation'

interface UseEditorInteractionStateOptions {
  runtimeActiveStepIndex: Ref<number>
  panelsState: Ref<Panel[]>
}

export function useEditorInteractionState(options: UseEditorInteractionStateOptions) {
  const flowEditorRef = ref<FlowEditorExposed | null>(null)
  const isFlowEditorOpen = ref(true)
  const isMobileBarOpen = ref(false)
  const activeSlideIndex = ref(0)

  watch(
    () => options.runtimeActiveStepIndex.value,
    (nextIndex) => {
      const total = options.panelsState.value.length
      if (!total) {
        activeSlideIndex.value = 0
        return
      }
      activeSlideIndex.value = Math.max(0, Math.min(nextIndex, total - 1))
    },
    { immediate: true }
  )

  const handleToggleEditor = () => {
    const next = flowEditorRef.value?.toggleFlowEditor()
    if (typeof next === 'boolean') {
      isFlowEditorOpen.value = next
      return
    }
    isFlowEditorOpen.value = !isFlowEditorOpen.value
  }

  const openSlideEditor = (index: number) => {
    activeSlideIndex.value = index
    flowEditorRef.value?.openSlideSettings(index)
  }

  const handleEditCurrentSlide = () => {
    const total = options.panelsState.value.length
    if (!total) return
    const safeIndex = Math.max(0, Math.min(activeSlideIndex.value, total - 1))
    flowEditorRef.value?.openSlideSettings(safeIndex)
  }

  const closeMobileMenu = () => {
    isMobileBarOpen.value = false
  }

  const toggleMobileMenu = () => {
    isMobileBarOpen.value = !isMobileBarOpen.value
  }

  onMounted(() => {
    isFlowEditorOpen.value = flowEditorRef.value?.isFlowEditorOpen() ?? true
  })

  const hasPanels = computed(() => options.panelsState.value.length > 0)

  return {
    flowEditorRef,
    isFlowEditorOpen,
    isMobileBarOpen,
    activeSlideIndex,
    hasPanels,
    openSlideEditor,
    handleEditCurrentSlide,
    handleToggleEditor,
    closeMobileMenu,
    toggleMobileMenu
  }
}
