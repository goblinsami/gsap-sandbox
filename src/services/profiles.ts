import { supabase } from '@/lib/supabase'
import { UserRole } from '@/config/plans'

export interface UserProfile {
  id: string
  email: string
  plan: UserRole
}

const PROFILE_SELECT_FIELDS = 'id, email, plan'

const normalizePlan = (value: string | null | undefined): UserRole => {
  if (value === UserRole.Creator) return UserRole.Creator
  if (value === UserRole.Free) return UserRole.Free
  return UserRole.Free
}

export async function getCurrentProfile(userId: string): Promise<UserProfile | null> {
  console.log('[profiles] getCurrentProfile:start', { userId })

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT_FIELDS)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[profiles] getCurrentProfile:error', error)
    throw error
  }

  if (!data) {
    console.log('[profiles] getCurrentProfile:not-found')
    return null
  }

  const profile: UserProfile = {
    id: String(data.id),
    email: String(data.email ?? ''),
    plan: normalizePlan(data.plan as string | undefined)
  }
  console.log('[profiles] getCurrentProfile:success', profile)
  return profile
}

