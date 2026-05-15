import type { ContentSchema } from '../types/navigation'

const STORY_ID_FALLBACK = 'welcome'
const STORY_ID_REGEX = /[^a-zA-Z0-9_-]/g
const FALLBACK_STORY_IDS = ['welcome', 'demo', 'ai-startup']

const sanitizeStoryId = (storyId: string) => {
  const trimmed = storyId.trim().replace(STORY_ID_REGEX, '')
  return trimmed || STORY_ID_FALLBACK
}

export async function loadStory(storyId: string): Promise<ContentSchema> {
  const safeStoryId = sanitizeStoryId(storyId)
  const response = await fetch(`/stories/${safeStoryId}.json`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Story "${safeStoryId}" not found (HTTP ${response.status}).`)
  }

  return (await response.json()) as ContentSchema
}

export async function listStories(): Promise<string[]> {
  try {
    const response = await fetch('/stories/index.json', { cache: 'no-store' })
    if (!response.ok) return FALLBACK_STORY_IDS
    const payload = (await response.json()) as { stories?: string[] }
    const stories = (payload.stories ?? []).filter((id) => typeof id === 'string')
    return stories.length ? stories : FALLBACK_STORY_IDS
  } catch (_error) {
    return FALLBACK_STORY_IDS
  }
}
