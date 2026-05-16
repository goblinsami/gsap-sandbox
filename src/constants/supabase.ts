export const SUPABASE_TABLES = {
  Stories: 'stories',
  Profiles: 'profiles'
} as const

export const STORY_SELECT_FIELDS = 'id, user_id, title, content_json, published, created_at, updated_at'
export const STORY_LIST_SELECT_FIELDS = 'id, title, updated_at, published'
export const PROFILE_SELECT_FIELDS = 'id, email, plan'
