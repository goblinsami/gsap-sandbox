import { supabase } from '@/lib/supabase'
import { UserRole } from '@/config/plans'
import { PROFILE_SELECT_FIELDS, SUPABASE_TABLES } from '@/constants/supabase'
import type { UserProfile } from '@/types/profile'
import { debugLog } from '@/utils/logger'

const normalizePlan = (value: string | null | undefined): UserRole => {
  if (value === UserRole.Creator) return UserRole.Creator
  if (value === UserRole.Free) return UserRole.Free
  return UserRole.Free
}

export async function getCurrentProfile(userId: string): Promise<UserProfile | null> {
  debugLog('[profiles] getCurrentProfile:start', { userId })

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.Profiles)
    .select(PROFILE_SELECT_FIELDS)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[profiles] getCurrentProfile:error', error)
    throw error
  }

  if (!data) {
    debugLog('[profiles] getCurrentProfile:not-found')
    return null
  }

  const profile: UserProfile = {
    id: String(data.id),
    email: String(data.email ?? ''),
    plan: normalizePlan(data.plan as string | undefined)
  }
  debugLog('[profiles] getCurrentProfile:success', profile)
  return profile
}

