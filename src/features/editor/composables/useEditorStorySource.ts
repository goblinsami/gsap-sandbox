import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DEFAULT_EDIT_STORY_ID, STORY_ROUTE_PARAM } from '@/constants/routes'
import { listStories, loadStory } from '@/core/storySource'
import type { ContentSchema } from '@/types/navigation'

interface UseEditorStorySourceOptions {
  onRouteStoryChanged?: () => void
}

const EMPTY_SCHEMA: ContentSchema = { panels: [] }

export function useEditorStorySource(options: UseEditorStorySourceOptions = {}) {
  const route = useRoute()
  const storySchema = ref<ContentSchema | null>(null)
  const availableStories = ref<string[]>([])
  let activeLoadRequestId = 0

  const routeStoryId = computed(() => {
    const raw = route.params[STORY_ROUTE_PARAM]
    if (typeof raw !== 'string') return DEFAULT_EDIT_STORY_ID
    return raw.trim() || DEFAULT_EDIT_STORY_ID
  })

  const loadRouteStory = async (storyId: string) => {
    const requestId = ++activeLoadRequestId
    try {
      const schema = await loadStory(storyId)
      if (requestId !== activeLoadRequestId) return
      storySchema.value = schema
      options.onRouteStoryChanged?.()
    } catch (error) {
      if (requestId !== activeLoadRequestId) return
      console.warn(`[edit] Failed to load story "${storyId}"`, error)
      storySchema.value = EMPTY_SCHEMA
      options.onRouteStoryChanged?.()
    }
  }

  watch(
    () => routeStoryId.value,
    async (storyId) => {
      await loadRouteStory(storyId)
    },
    { immediate: true }
  )

  onMounted(async () => {
    availableStories.value = await listStories()
  })

  return {
    routeStoryId,
    storySchema,
    availableStories,
    setStorySchema: (schema: ContentSchema) => {
      storySchema.value = schema
    }
  }
}
