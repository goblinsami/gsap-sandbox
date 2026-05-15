export const UserRole = {
  Anonymous: 'anonymous',
  Free: 'free',
  Creator: 'creator'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface PlanLimit {
  maxStories: number
  canSave: boolean
  canPublish: boolean
  canUploadImages: boolean
  canUsePremiumLayouts: boolean
  canRemoveWatermark: boolean
}

export const PLAN_LIMITS: Record<UserRole, PlanLimit> = {
  anonymous: {
    maxStories: 0,
    canSave: false,
    canPublish: false,
    canUploadImages: false,
    canUsePremiumLayouts: false,
    canRemoveWatermark: false
  },
  free: {
    maxStories: 1,
    canSave: true,
    canPublish: true,
    canUploadImages: true,
    canUsePremiumLayouts: false,
    canRemoveWatermark: false
  },
  creator: {
    maxStories: Number.POSITIVE_INFINITY,
    canSave: true,
    canPublish: true,
    canUploadImages: true,
    canUsePremiumLayouts: true,
    canRemoveWatermark: true
  }
}

