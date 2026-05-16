import type { UserRole } from '@/config/plans'

export interface UserProfile {
  id: string
  email: string
  plan: UserRole
}
