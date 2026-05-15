<template>
  <main class="embed-root">
    <StoryRenderer
      :flow-steps="flowSteps"
      :auto-snap-enabled="autoSnapEnabled"
      :set-snap-shell-el="setSnapShellEl"
      :set-snap-stage-el="setSnapStageEl"
      :step-style="stepStyle"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '../styles/core.css'
import '../styles/embed.css'
import StoryRenderer from '../core/StoryRenderer.vue'
import { useStoryRuntime } from '../core/useStoryRuntime'
import { loadStory } from '../embed/loadStory'
import type { ContentSchema } from '../types/navigation'

const route = useRoute()
const storySchema = ref<ContentSchema | null>(null)

const routeStoryId = computed(() => {
  const value = route.query.story
  if (typeof value !== 'string') return 'welcome'
  return value.trim() || 'welcome'
})

watch(
  () => routeStoryId.value,
  async (storyId) => {
    try {
      storySchema.value = await loadStory(storyId)
    } catch (error) {
      console.warn(`[embed] Failed to load story "${storyId}"`, error)
      storySchema.value = { panels: [] }
    }
  },
  { immediate: true }
)

const {
  autoSnapEnabled,
  flowSteps,
  snapShellRef,
  snapStageRef,
  stepStyle
} = useStoryRuntime(storySchema, { logPrefix: '[flow-embed]' })

const setSnapShellEl = (element: HTMLElement | null) => {
  snapShellRef.value = element
}

const setSnapStageEl = (element: HTMLElement | null) => {
  snapStageRef.value = element
}
</script>
