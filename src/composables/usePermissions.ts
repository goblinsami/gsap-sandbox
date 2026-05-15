import { computed, ref, watch } from 'vue'
import { PLAN_LIMITS, UserRole } from '@/config/plans'
import { useAuth } from '@/composables/useAuth'
import { getCurrentProfile, type UserProfile } from '@/services/profiles'

export function usePermissions(storyCountRef?: { value: number }) {
  const { user, loading: authLoading } = useAuth()
  const profile = ref<UserProfile | null>(null)
  const profileLoading = ref(false)

  const role = computed(() => {
    if (!user.value) return UserRole.Anonymous
    if (profile.value?.plan === UserRole.Creator) return UserRole.Creator
    return UserRole.Free
  })

  const isAnonymous = computed(() => role.value === UserRole.Anonymous)
  const isFree = computed(() => role.value === UserRole.Free)
  const isCreator = computed(() => role.value === UserRole.Creator)
  const limits = computed(() => PLAN_LIMITS[role.value])
  const currentStoryCount = computed(() => storyCountRef?.value ?? 0)

  const canSave = computed(() => limits.value.canSave)
  const canPublish = computed(() => limits.value.canPublish)
  const canUploadImages = computed(() => limits.value.canUploadImages)
  const canUsePremiumLayouts = computed(() => limits.value.canUsePremiumLayouts)
  const canRemoveWatermark = computed(() => limits.value.canRemoveWatermark)
  const maxStories = computed(() => limits.value.maxStories)
  const canCreateStory = computed(() => canSave.value)
  const canCreateMoreStories = computed(() => {
    if (!Number.isFinite(maxStories.value)) return true
    return currentStoryCount.value < maxStories.value
  })

  const showUpgradePrompts = computed(() => isFree.value || isAnonymous.value)
  const showPremiumLocks = computed(() => !canUsePremiumLayouts.value)
  const showSandboxHints = computed(() => isAnonymous.value)
  const showCreatorBadges = computed(() => isCreator.value)
  const showPublishLoginPrompt = computed(() => isAnonymous.value)
  const showWatermark = computed(() => isFree.value)

  watch(
    () => user.value?.id ?? null,
    async (userId) => {
      profile.value = null
      if (!userId) return
      profileLoading.value = true
      try {
        profile.value = await getCurrentProfile(userId)
      } catch (error) {
        console.warn('[permissions] profile load failed, defaulting to free', error)
      } finally {
        profileLoading.value = false
      }
    },
    { immediate: true }
  )

  const loading = computed(() => authLoading.value || profileLoading.value)

  return {
    role,
    profile,
    loading,
    isAnonymous,
    isFree,
    isCreator,
    canSave,
    canPublish,
    canUploadImages,
    canUsePremiumLayouts,
    canRemoveWatermark,
    canCreateStory,
    canCreateMoreStories,
    maxStories,
    showUpgradePrompts,
    showPremiumLocks,
    showSandboxHints,
    showCreatorBadges,
    showPublishLoginPrompt,
    showWatermark
  }
}
