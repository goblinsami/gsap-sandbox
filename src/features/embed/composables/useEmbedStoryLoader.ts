import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { STORY_ROUTE_PARAM } from '@/constants/routes'
import { getPublicStoryById } from '@/services/stories'
import type { ContentSchema } from '@/types/navigation'

const INVALID_STORY_ID_ERROR = 'Invalid story id.'
const STORY_NOT_FOUND_ERROR = 'Story not found or not published.'

const cloneSchema = (schema: ContentSchema): ContentSchema => ({
  ...schema,
  panels: schema.panels.map((panel) => ({ ...panel }))
})

export function useEmbedStoryLoader() {
  const route = useRoute()
  const storySchema = ref<ContentSchema | null>(null)
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  let activeLoadRequestId = 0

  const routeStoryId = computed(() => {
    const raw = route.params[STORY_ROUTE_PARAM]
    if (typeof raw !== 'string') return ''
    return raw.trim()
  })

  watch(
    () => routeStoryId.value,
    async (storyId) => {
      const requestId = ++activeLoadRequestId
      if (!storyId) {
        storySchema.value = null
        loadError.value = INVALID_STORY_ID_ERROR
        isLoading.value = false
        return
      }

      isLoading.value = true
      loadError.value = null

      try {
        const story = await getPublicStoryById(storyId)
        if (requestId !== activeLoadRequestId) return
        storySchema.value = cloneSchema(story.content_json)
      } catch (error) {
        if (requestId !== activeLoadRequestId) return
        console.warn(`[embed] Failed to load public story "${storyId}"`, error)
        storySchema.value = null
        loadError.value = STORY_NOT_FOUND_ERROR
      } finally {
        if (requestId !== activeLoadRequestId) return
        isLoading.value = false
      }
    },
    { immediate: true }
  )

  const embedWatermarkEnabled = computed(() => storySchema.value?.watermarkEnabled ?? true)
  const embedEnableCtas = computed(() => storySchema.value?.enableCtas ?? true)

  return {
    storySchema,
    isLoading,
    loadError,
    embedWatermarkEnabled,
    embedEnableCtas
  }
}
