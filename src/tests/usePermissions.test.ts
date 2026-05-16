import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { UserRole } from '../config/plans'

const mockUser = ref<{ id: string; email?: string | null } | null>(null)
const mockAuthLoading = ref(false)
const getCurrentProfileMock = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockAuthLoading
  })
}))

vi.mock('@/services/profiles', () => ({
  getCurrentProfile: (...args: unknown[]) => getCurrentProfileMock(...args)
}))

import { usePermissions } from '@/composables/usePermissions'

const flush = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('usePermissions', () => {
  beforeEach(() => {
    mockUser.value = null
    mockAuthLoading.value = false
    getCurrentProfileMock.mockReset()
  })

  it('resolves anonymous permissions when user is not authenticated', async () => {
    const storyCount = ref(0)
    const permissions = usePermissions(storyCount)
    await flush()

    expect(permissions.role.value).toBe(UserRole.Anonymous)
    expect(permissions.canSave.value).toBe(false)
    expect(permissions.canPublish.value).toBe(false)
    expect(permissions.showSandboxHints.value).toBe(true)
    expect(permissions.showWatermark.value).toBe(false)
  })

  it('resolves free user permissions by default for authenticated users', async () => {
    getCurrentProfileMock.mockResolvedValueOnce({
      id: 'user-1',
      email: 'free@test.com',
      plan: UserRole.Free
    })

    mockUser.value = { id: 'user-1', email: 'free@test.com' }
    const storyCount = ref(1)
    const permissions = usePermissions(storyCount)
    await flush()

    expect(permissions.role.value).toBe(UserRole.Free)
    expect(permissions.canSave.value).toBe(true)
    expect(permissions.canCreateMoreStories.value).toBe(false)
    expect(permissions.showPremiumLocks.value).toBe(true)
    expect(permissions.showWatermark.value).toBe(true)
  })

  it('resolves creator permissions when profile plan is creator', async () => {
    getCurrentProfileMock.mockResolvedValueOnce({
      id: 'user-2',
      email: 'creator@test.com',
      plan: UserRole.Creator
    })

    mockUser.value = { id: 'user-2', email: 'creator@test.com' }
    const storyCount = ref(999)
    const permissions = usePermissions(storyCount)
    await flush()

    expect(permissions.role.value).toBe(UserRole.Creator)
    expect(permissions.canUsePremiumLayouts.value).toBe(true)
    expect(permissions.canRemoveWatermark.value).toBe(true)
    expect(permissions.showUpgradePrompts.value).toBe(false)
    expect(permissions.canCreateMoreStories.value).toBe(true)
  })

  it('falls back to free when profile loading fails', async () => {
    getCurrentProfileMock.mockRejectedValueOnce(new Error('profile fetch failed'))

    mockUser.value = { id: 'user-3', email: 'fallback@test.com' }
    const storyCount = ref(0)
    const permissions = usePermissions(storyCount)
    await flush()

    expect(permissions.role.value).toBe(UserRole.Free)
    expect(permissions.canSave.value).toBe(true)
    expect(permissions.showPremiumLocks.value).toBe(true)
  })
})
