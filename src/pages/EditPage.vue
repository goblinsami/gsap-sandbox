<template>
  <main class="sandbox">
    <FlowEditor
      ref="flowEditorRef"
      :panels="panelsState"
      :auto-snap-enabled="autoSnapEnabled"
      :snap-ease="snapEase"
      :transition-speed="transitionSpeed"
      :auto-play-enabled="autoPlayEnabled"
      :auto-play-speed="autoPlaySpeed"
      :loop-enabled="loopEnabled"
      :ease-options="SNAP_EASE_OPTIONS"
      :available-stories="availableStories"
      @update:panels="handlePanelsUpdate"
      @update:auto-snap-enabled="handleAutoSnapEnabledUpdate"
      @update:snap-ease="handleSnapEaseUpdate"
      @update:transition-speed="handleTransitionSpeedUpdate"
      @update:auto-play-enabled="handleAutoPlayEnabledUpdate"
      @update:auto-play-speed="handleAutoPlaySpeedUpdate"
      @update:loop-enabled="handleLoopEnabledUpdate"
      @focus-step="focusStep"
    />

    <StoryRenderer
      :flow-steps="flowSteps"
      :auto-snap-enabled="autoSnapEnabled"
      :set-snap-shell-el="setSnapShellEl"
      :set-snap-stage-el="setSnapStageEl"
      :step-style="stepStyle"
      :show-edit-trigger="true"
      @edit-slide="openSlideEditor"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '../styles/editor.css'
import FlowEditor from '../editor/components/flow-creator/FlowEditor.vue'
import StoryRenderer from '../core/StoryRenderer.vue'
import { useStoryRuntime } from '../core/useStoryRuntime'
import { listStories, loadStory } from '../core/storySource'
import { SNAP_EASE_OPTIONS } from '../constants/snapEase'
import type { ContentSchema } from '../types/navigation'

const route = useRoute()
const storySchema = ref<ContentSchema | null>(null)
const availableStories = ref<string[]>([])

const routeStoryId = computed(() => {
  const value = route.params.id
  if (typeof value !== 'string') return 'welcome'
  return value.trim() || 'welcome'
})

watch(
  () => routeStoryId.value,
  async (storyId) => {
    try {
      storySchema.value = await loadStory(storyId)
    } catch (error) {
      console.warn(`[edit] Failed to load story "${storyId}"`, error)
      storySchema.value = { panels: [] }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  availableStories.value = await listStories()
})

const {
  autoSnapEnabled,
  autoPlayEnabled,
  autoPlaySpeed,
  flowSteps,
  loopEnabled,
  panelsState,
  snapEase,
  transitionSpeed,
  snapShellRef,
  snapStageRef,
  stepStyle,
  focusStep,
  handlePanelsUpdate,
  handleSnapEaseUpdate,
  handleAutoSnapEnabledUpdate,
  handleTransitionSpeedUpdate,
  handleAutoPlayEnabledUpdate,
  handleAutoPlaySpeedUpdate,
  handleLoopEnabledUpdate
} = useStoryRuntime(storySchema, { logPrefix: '[flow-edit]' })

const flowEditorRef = ref<{ openSlideSettings: (index: number) => void } | null>(null)

const openSlideEditor = (index: number) => {
  flowEditorRef.value?.openSlideSettings(index)
}

const setSnapShellEl = (element: HTMLElement | null) => {
  snapShellRef.value = element
}

const setSnapStageEl = (element: HTMLElement | null) => {
  snapStageRef.value = element
}
</script>
