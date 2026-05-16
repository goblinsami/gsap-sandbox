<template>
  <main class="embed-root">
    <p v-if="isLoading" class="embed-status">Loading story...</p>
    <p v-else-if="loadError" class="embed-status">{{ loadError }}</p>
    <StoryRenderer
      v-else
      :flow-steps="flowSteps"
      :auto-snap-enabled="autoSnapEnabled"
      :set-snap-shell-el="setSnapShellEl"
      :set-snap-stage-el="setSnapStageEl"
      :step-style="stepStyle"
      :show-watermark="embedWatermarkEnabled"
      :enable-ctas="embedEnableCtas"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '../styles/core.css'
import '../styles/embed.css'
import '../styles/pages/embed-page.css'
import StoryRenderer from '../core/StoryRenderer.vue'
import { useStoryRuntime } from '../core/useStoryRuntime'
import { getPublicStoryById } from '../services/stories'
import type { ContentSchema } from '../types/navigation'

const route = useRoute()
const storySchema = ref<ContentSchema | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const routeStoryId = computed(() => {
  const value = route.params.id
  if (typeof value !== 'string') return ''
  return value.trim()
})

watch(
  () => routeStoryId.value,
  async (storyId) => {
    if (!storyId) {
      storySchema.value = null
      loadError.value = 'Invalid story id.'
      return
    }

    isLoading.value = true
    loadError.value = null

    try {
      const story = await getPublicStoryById(storyId)
      storySchema.value = { ...story.content_json, panels: [...story.content_json.panels] }
    } catch (error) {
      console.warn(`[embed] Failed to load public story "${storyId}"`, error)
      storySchema.value = null
      loadError.value = 'Story not found or not published.'
    } finally {
      isLoading.value = false
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

const embedWatermarkEnabled = computed(() => storySchema.value?.watermarkEnabled ?? true)
const embedEnableCtas = computed(() => storySchema.value?.enableCtas ?? true)

const setSnapShellEl = (element: HTMLElement | null) => {
  snapShellRef.value = element
}

const setSnapStageEl = (element: HTMLElement | null) => {
  snapStageRef.value = element
}
</script>



