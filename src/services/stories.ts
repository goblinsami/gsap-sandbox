import { supabase } from '@/lib/supabase'
import type { ContentSchema } from '@/types/navigation'
import type { PostgrestError } from '@supabase/supabase-js'

export interface SaveStoryInput {
  userId: string
  title: string
  content: ContentSchema
}

export interface SavedStory {
  id: string
  user_id: string
  title: string
  content_json: ContentSchema
  published: boolean
  created_at: string
  updated_at: string
}

export interface StoryListItem {
  id: string
  title: string
  updated_at: string
  published?: boolean
}

const STORY_SELECT_FIELDS = 'id, user_id, title, content_json, published, created_at, updated_at'
const STORY_LIST_SELECT_FIELDS = 'id, title, updated_at, published'

const isRlsViolation = (error: PostgrestError | null): boolean => {
  if (!error) return false
  return error.code === '42501'
}

export async function saveStory({ userId, title, content }: SaveStoryInput): Promise<SavedStory> {
  const normalizedTitle = title.trim() || 'Untitled Story'

  console.log('[stories] saveStory:start', {
    userId,
    title: normalizedTitle
  })

  try {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        title: normalizedTitle,
        content_json: content,
        published: false
      })
      .select(STORY_SELECT_FIELDS)
      .single()

    if (error) {
      console.error('[stories] saveStory:supabase-error', error)
      if (isRlsViolation(error)) {
        console.error(
          '[stories] RLS policy blocked insert/select on public.stories. Check INSERT WITH CHECK(auth.uid() = user_id) and SELECT USING(auth.uid() = user_id) policies.'
        )
      }
      throw error
    }

    if (!data) {
      const noDataError = new Error('saveStory returned no data.')
      console.error('[stories] saveStory:no-data', noDataError)
      throw noDataError
    }

    console.log('[stories] saveStory:success', data)
    console.log('[stories] saveStory:id', data.id)

    return data as SavedStory
  } catch (error) {
    console.error('[stories] saveStory:failed', error)
    throw error
  }
}

export async function updateStory({
  storyId,
  userId,
  title,
  content
}: SaveStoryInput & { storyId: string }): Promise<SavedStory> {
  const normalizedTitle = title.trim() || 'Untitled Story'

  console.log('[stories] updateStory:start', {
    storyId,
    userId,
    title: normalizedTitle
  })

  try {
    const { data, error } = await supabase
      .from('stories')
      .update({
        title: normalizedTitle,
        content_json: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .eq('user_id', userId)
      .select(STORY_SELECT_FIELDS)
      .single()

    if (error) {
      console.error('[stories] updateStory:supabase-error', error)
      if (isRlsViolation(error)) {
        console.error(
          '[stories] RLS policy blocked update/select on public.stories. Check UPDATE USING(auth.uid() = user_id) and SELECT USING(auth.uid() = user_id) policies.'
        )
      }
      throw error
    }

    if (!data) {
      const noDataError = new Error('updateStory returned no data.')
      console.error('[stories] updateStory:no-data', noDataError)
      throw noDataError
    }

    console.log('[stories] updateStory:success', data)
    console.log('[stories] updateStory:id', data.id)

    return data as SavedStory
  } catch (error) {
    console.error('[stories] updateStory:failed', error)
    throw error
  }
}

export async function getStories(userId: string): Promise<StoryListItem[]> {
  console.log('[stories] getStories:start', { userId })

  try {
    const { data, error } = await supabase
      .from('stories')
      .select(STORY_LIST_SELECT_FIELDS)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[stories] getStories:supabase-error', error)
      throw error
    }

    const stories = (data ?? []) as StoryListItem[]
    console.log('[stories] getStories:success', { count: stories.length })
    return stories
  } catch (error) {
    console.error('[stories] getStories:failed', error)
    throw error
  }
}

export async function getStoryById(storyId: string): Promise<SavedStory> {
  console.log('[stories] getStoryById:start', { storyId })

  try {
    const { data, error } = await supabase
      .from('stories')
      .select(STORY_SELECT_FIELDS)
      .eq('id', storyId)
      .single()

    if (error) {
      console.error('[stories] getStoryById:supabase-error', error)
      if (isRlsViolation(error)) {
        console.error('[stories] RLS blocked getStoryById. Check SELECT policy on public.stories.')
      }
      throw error
    }

    if (!data) {
      const noDataError = new Error('getStoryById returned no data.')
      console.error('[stories] getStoryById:no-data', noDataError)
      throw noDataError
    }

    console.log('[stories] getStoryById:success', { id: data.id, title: data.title })
    return data as SavedStory
  } catch (error) {
    console.error('[stories] getStoryById:failed', error)
    throw error
  }
}

export async function getPublicStoryById(storyId: string): Promise<SavedStory> {
  console.log('[stories] getPublicStoryById:start', { storyId })

  try {
    const { data, error } = await supabase
      .from('stories')
      .select(STORY_SELECT_FIELDS)
      .eq('id', storyId)
      .eq('published', true)
      .single()

    if (error) {
      console.error('[stories] getPublicStoryById:supabase-error', error)
      throw error
    }

    if (!data) {
      const noDataError = new Error('getPublicStoryById returned no data.')
      console.error('[stories] getPublicStoryById:no-data', noDataError)
      throw noDataError
    }

    console.log('[stories] getPublicStoryById:success', { id: data.id, title: data.title })
    return data as SavedStory
  } catch (error) {
    console.error('[stories] getPublicStoryById:failed', error)
    throw error
  }
}

export async function publishStory({
  storyId,
  userId
}: {
  storyId: string
  userId: string
}): Promise<SavedStory> {
  console.log('[stories] publishStory:start', { storyId, userId })

  try {
    const { data, error } = await supabase
      .from('stories')
      .update({
        published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .eq('user_id', userId)
      .select(STORY_SELECT_FIELDS)
      .single()

    if (error) {
      console.error('[stories] publishStory:supabase-error', error)
      if (isRlsViolation(error)) {
        console.error('[stories] RLS blocked publishStory update/select on public.stories.')
      }
      throw error
    }

    if (!data) {
      const noDataError = new Error('publishStory returned no data.')
      console.error('[stories] publishStory:no-data', noDataError)
      throw noDataError
    }

    console.log('[stories] publishStory:success', { id: data.id, published: data.published })
    return data as SavedStory
  } catch (error) {
    console.error('[stories] publishStory:failed', error)
    throw error
  }
}
