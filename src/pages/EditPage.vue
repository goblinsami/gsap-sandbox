<template>
  <main class="sandbox">
    <header class="user-bar">
      <button
        class="user-bar__burger"
        type="button"
        :aria-expanded="isMobileBarOpen"
        aria-controls="user-bar-content"
        @click="isMobileBarOpen = !isMobileBarOpen"
      >
        ☰
      </button>

      <div id="user-bar-content" class="user-bar__content" :class="{ 'user-bar__content--open': isMobileBarOpen }">
      <div class="user-bar__left">
        <button
          class="edit-slide-button"
          type="button"
          @click="handleEditCurrentSlide"
        >
          Edit Slide
        </button>
        <EditorToggleButton
          :is-open="isFlowEditorOpen"
          :logo-url="editorToggleLogoUrl"
          @toggle="handleToggleEditor"
        />
      </div>

      <div class="user-bar__identity">
        <div class="auth-chip">
          <template v-if="permissionsLoading">
            <span class="auth-chip__label">Auth</span>
            <span class="auth-chip__status">Loading...</span>
          </template>
          <template v-else-if="user?.email">
            <span class="auth-chip__status">{{ user.email }}</span>
            <button
              class="google-login-button google-login-button--logout auth-chip__logout"
              type="button"
              :disabled="permissionsLoading"
              @click="handleLogout"
            >
              <span class="google-login-button__text">Logout</span>
            </button>
          </template>
          <template v-else>
            <span class="auth-chip__label">Auth</span>
            <span class="auth-chip__status">Not signed in</span>
          </template>
        </div>
        <span class="plan-indicator__value" :class="`plan-indicator__value--${role}`">{{ role }}</span>
        <span v-if="showUpgradePrompts" class="status-note">{{ storyUsageText }}</span>
      </div>

      <div class="user-bar__actions">
        <button
          v-if="!user"
          class="google-login-button"
          type="button"
          :disabled="permissionsLoading"
          @click="handleLogin"
        >
          <span class="google-login-button__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.4l2.7-2.6C16.9 2.9 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.8H12z"
              />
              <path
                fill="#34A853"
                d="M3.2 7.3l3.2 2.3C7.2 7.9 9.4 6.2 12 6.2c1.9 0 3.2.8 3.9 1.4l2.7-2.6C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3.2 7.3z"
              />
              <path
                fill="#4A90E2"
                d="M12 22c2.6 0 4.8-.9 6.4-2.4l-3-2.5c-.8.6-1.9 1-3.4 1-4.1 0-5.2-2.7-5.5-3.6l-3.2 2.5C4.7 19.8 8.1 22 12 22z"
              />
              <path
                fill="#FBBC05"
                d="M3.2 16.7l3.2-2.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.2 7.7C2.4 9 2 10.4 2 12s.4 3 1.2 4.7z"
              />
            </svg>
          </span>
          <span class="google-login-button__text">Login</span>
        </button>
        <button
          v-if="user"
          class="save-story-button"
          type="button"
          :disabled="permissionsLoading || isSavingStory || !canSave"
          @click="handleSaveStory"
        >
          <span v-if="isSavingStory">Saving...</span>
          <span v-else>Save</span>
        </button>
        <button
          v-if="user"
          class="publish-story-button"
          type="button"
          :disabled="permissionsLoading || isPublishingStory || !canPublish"
          @click="handlePublishStory"
        >
          <span v-if="isPublishingStory">Publishing...</span>
          <span v-else>Publish</span>
        </button>
        <button
          v-if="user && publishedStoryId"
          class="share-box__button"
          type="button"
          @click="copyPublicLink"
        >
          Copy Link
        </button>
        <button
          v-if="user && publishedStoryId"
          class="share-box__button"
          type="button"
          @click="copyEmbedCode"
        >
          Copy iFrame
        </button>

        <details v-if="user" ref="myStoriesDropdownRef" class="mini-dropdown">
          <summary class="mini-dropdown__summary">My Stories</summary>
          <div class="mini-dropdown__body">
            <p v-if="isLoadingStories" class="my-stories__hint">Loading stories...</p>
            <p v-else-if="myStories.length === 0" class="my-stories__hint">No stories yet.</p>
            <ul v-else class="my-stories__list">
              <li v-for="story in myStories" :key="story.id" class="my-stories__item">
                <div class="my-stories__meta">
                  <strong class="my-stories__story-title">{{ story.title }}</strong>
                  <span class="my-stories__date">{{ story.updated_at }} <b v-if="story.published">• Published</b></span>
                </div>
                <button
                  class="my-stories__open-button"
                  type="button"
                  :disabled="isOpeningStory"
                  @click="handleOpenStory(story.id)"
                >
                  Open
                </button>
              </li>
            </ul>
          </div>
        </details>
      </div>
      </div>
    </header>

    <div class="editor-hover-toggle">
      <EditorToggleButton
        :is-open="isFlowEditorOpen"
        :logo-url="editorToggleLogoUrl"
        @toggle="handleToggleEditor"
      />
    </div>

    <FlowEditor
      ref="flowEditorRef"
      :panels="panelsState"
      :auto-snap-enabled="autoSnapEnabled"
      :snap-ease="snapEase"
      :transition-speed="transitionSpeed"
      :auto-play-enabled="autoPlayEnabled"
      :auto-play-speed="autoPlaySpeed"
      :loop-enabled="loopEnabled"
      :ease-options="SNAP_EASE_OPTIONS"
      :available-stories="availableStories"
      :can-upload-images="canUploadImages"
      @update:panels="handlePanelsUpdate"
      @update:auto-snap-enabled="handleAutoSnapEnabledUpdate"
      @update:snap-ease="handleSnapEaseUpdate"
      @update:transition-speed="handleTransitionSpeedUpdate"
      @update:auto-play-enabled="handleAutoPlayEnabledUpdate"
      @update:auto-play-speed="handleAutoPlaySpeedUpdate"
      @update:loop-enabled="handleLoopEnabledUpdate"
      @focus-step="focusStep"
    />

    <StoryRenderer
      :flow-steps="flowSteps"
      :auto-snap-enabled="autoSnapEnabled"
      :set-snap-shell-el="setSnapShellEl"
      :set-snap-stage-el="setSnapStageEl"
      :step-style="stepStyle"
      :show-edit-trigger="false"
      :show-watermark="showWatermark"
      @edit-slide="openSlideEditor"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '../styles/core.css'
import '../styles/editor.css'
import '../styles/pages/edit-page.css'
import EditorToggleButton from '../components/EditorToggleButton.vue'
import FlowEditor from '../editor/components/flow-creator/FlowEditor.vue'
import StoryRenderer from '../core/StoryRenderer.vue'
import { useStoryRuntime } from '../core/useStoryRuntime'
import { listStories, loadStory } from '../core/storySource'
import { SNAP_EASE_OPTIONS } from '../constants/snapEase'
import { useAuth } from '../composables/useAuth'
import { usePermissions } from '../composables/usePermissions'
import { getStories, getStoryById, publishStory, saveStory, updateStory, type StoryListItem } from '../services/stories'
import { supabase } from '../lib/supabase'
import type { ContentSchema } from '../types/navigation'

const route = useRoute()
const storySchema = ref<ContentSchema | null>(null)
const availableStories = ref<string[]>([])
const currentStoryId = ref<string | null>(null)
const PUBLIC_APP_URL = String(import.meta.env.VITE_PUBLIC_APP_URL ?? 'https://scrollix.netlify.app').trim()

const routeStoryId = computed(() => {
  const value = route.params.id
  if (typeof value !== 'string') return 'welcome'
  return value.trim() || 'welcome'
})

watch(
  () => routeStoryId.value,
  async (storyId) => {
    try {
      storySchema.value = await loadStory(storyId)
      currentStoryId.value = null
    } catch (error) {
      console.warn(`[edit] Failed to load story "${storyId}"`, error)
      storySchema.value = { panels: [] }
      currentStoryId.value = null
    }
  },
  { immediate: true }
)

onMounted(async () => {
  availableStories.value = await listStories()
})

const { user, signInWithGoogle, signOut } = useAuth()
const isSavingStory = ref(false)
const isPublishingStory = ref(false)
const isLoadingStories = ref(false)
const isOpeningStory = ref(false)
const myStories = ref<StoryListItem[]>([])
const publishedStoryId = ref<string | null>(null)
const shareFeedback = ref('')
const myStoriesDropdownRef = ref<HTMLElement | null>(null)
const storyCount = computed(() => myStories.value.length)

const {
  role,
  loading: permissionsLoading,
  canSave,
  canPublish,
  canUploadImages,
  canCreateMoreStories,
  maxStories,
  showUpgradePrompts,
  showWatermark
} = usePermissions(storyCount)

const storyUsageText = computed(() => {
  if (!Number.isFinite(maxStories.value)) return `${storyCount.value} stories used`
  return `${storyCount.value} / ${maxStories.value} stories used`
})

const {
  autoSnapEnabled,
  autoPlayEnabled,
  autoPlaySpeed,
  flowSteps,
  loopEnabled,
  panelsState,
  snapEase,
  transitionSpeed,
  snapShellRef,
  snapStageRef,
  stepStyle,
  focusStep,
  handlePanelsUpdate,
  handleSnapEaseUpdate,
  handleAutoSnapEnabledUpdate,
  handleTransitionSpeedUpdate,
  handleAutoPlayEnabledUpdate,
  handleAutoPlaySpeedUpdate,
  handleLoopEnabledUpdate
} = useStoryRuntime(storySchema, { logPrefix: '[flow-edit]' })

const flowEditorRef = ref<{
  openSlideSettings: (index: number) => void
  toggleFlowEditor: () => boolean
  isFlowEditorOpen: () => boolean
} | null>(null)
const isFlowEditorOpen = ref(true)
const isMobileBarOpen = ref(false)
const activeSlideIndex = ref(0)
const editorToggleLogoUrl = `${import.meta.env.BASE_URL}favicon.png`
let snapShellScrollTarget: HTMLElement | null = null
let snapShellScrollHandler: (() => void) | null = null

const handleDocumentPointerDown = (event: MouseEvent | TouchEvent) => {
  const dropdown = myStoriesDropdownRef.value
  if (!dropdown || !dropdown.hasAttribute('open')) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (dropdown.contains(target)) return
  dropdown.removeAttribute('open')
}

const handleLogin = async () => {
  try {
    await signInWithGoogle()
  } catch (error) {
    console.warn('[auth] Google login failed', error)
  }
}

const handleLogout = async () => {
  try {
    await signOut()
  } catch (error) {
    console.warn('[auth] Logout failed', error)
  }
}

const buildCurrentStoryContent = (): ContentSchema => ({
  autoSnapEnabled: autoSnapEnabled.value,
  loopEnabled: loopEnabled.value,
  enableLoop: loopEnabled.value,
  snapEase: snapEase.value,
  transitionSpeed: transitionSpeed.value,
  autoPlayEnabled: autoPlayEnabled.value,
  autoPlaySpeed: autoPlaySpeed.value,
  watermarkEnabled: showWatermark.value,
  panels: panelsState.value.map((panel) => ({ ...panel }))
})

const buildStoryTitle = () => {
  const firstPanelTitle = panelsState.value.find((panel) => panel.title.trim())?.title.trim()
  if (firstPanelTitle) return firstPanelTitle
  return `Story ${routeStoryId.value}`
}

const resolveStoryBaseUrl = () => PUBLIC_APP_URL || 'https://scrollix.netlify.app'

const publicStoryUrl = computed(() => {
  if (!publishedStoryId.value) return ''
  return `${resolveStoryBaseUrl()}/embed/${publishedStoryId.value}`
})

const iframeEmbedCode = computed(() => {
  if (!publicStoryUrl.value) return ''
  return `<iframe src="${publicStoryUrl.value}" width="100%" height="900" style="border:none;overflow:hidden;"></iframe>`
})

const copyText = async (value: string, label: string) => {
  if (!value) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    console.log(`[share] Copied ${label}`)
    shareFeedback.value = `${label} copied`
  } catch (error) {
    console.error(`[share] Failed to copy ${label}`, error)
    shareFeedback.value = `Failed to copy ${label}`
  }
}

const copyPublicLink = async () => {
  await copyText(publicStoryUrl.value, 'public link')
}

const copyEmbedCode = async () => {
  await copyText(iframeEmbedCode.value, 'iframe embed code')
}

const handleSaveStory = async () => {
  console.log(user.value)
  console.log(user.value?.id)
  console.log(await supabase.auth.getSession())

  if (!canSave.value) {
    console.warn('[permissions] Save is disabled for current role.')
    return
  }
  if (!currentStoryId.value && !canCreateMoreStories.value) {
    console.warn('[permissions] Story limit reached. Upgrade to create more stories.')
    return
  }
  if (!user.value) return

  if (isSavingStory.value) return
  isSavingStory.value = true

  try {
    const content = buildCurrentStoryContent()
    const title = buildStoryTitle()
    const savedStory = currentStoryId.value
      ? await updateStory({
        storyId: currentStoryId.value,
        userId: user.value.id,
        title,
        content
      })
      : await saveStory({
        userId: user.value.id,
        title,
        content
      })

    console.log('[stories] Save completed', {
      id: savedStory.id,
      title: savedStory.title
    })
    currentStoryId.value = savedStory.id
    await refreshMyStories()
  } catch (error) {
    console.error('[stories] Save failed in editor', error)
  } finally {
    isSavingStory.value = false
  }
}

const handlePublishStory = async () => {
  if (!canPublish.value) {
    console.warn('[permissions] Publish is disabled for current role.')
    return
  }
  if (!currentStoryId.value && !canCreateMoreStories.value) {
    console.warn('[permissions] Story limit reached. Upgrade to publish more stories.')
    return
  }
  if (!user.value) return

  if (isPublishingStory.value) return
  isPublishingStory.value = true

  try {
    let storyId = currentStoryId.value
    if (!storyId) {
      const content = buildCurrentStoryContent()
      const title = buildStoryTitle()
      const createdStory = await saveStory({
        userId: user.value.id,
        title,
        content
      })
      storyId = createdStory.id
      currentStoryId.value = createdStory.id
      console.log('[stories] publish:auto-created-story', { storyId })
    }

    if (!storyId) {
      throw new Error('Unable to resolve story id for publish flow.')
    }

    const publishedStory = await publishStory({
      storyId,
      userId: user.value.id
    })

    publishedStoryId.value = publishedStory.id
    console.log('[stories] publish:completed', { id: publishedStory.id })
    await refreshMyStories()
  } catch (error) {
    console.error('[stories] publish:failed', error)
  } finally {
    isPublishingStory.value = false
  }
}

const refreshMyStories = async () => {
  if (!user.value) {
    myStories.value = []
    return
  }

  isLoadingStories.value = true
  try {
    console.log('[stories] loading stories list', { userId: user.value.id })
    myStories.value = await getStories(user.value.id)
  } catch (error) {
    console.error('[stories] failed loading stories list', error)
    myStories.value = []
  } finally {
    isLoadingStories.value = false
  }
}

const handleOpenStory = async (storyId: string) => {
  if (!user.value) {
    console.warn('[stories] Open cancelled: user is not authenticated.')
    return
  }

  if (isOpeningStory.value) return
  isOpeningStory.value = true

  try {
    console.log('[stories] opening story', { storyId })
    const story = await getStoryById(storyId)
    storySchema.value = { ...story.content_json, panels: [...story.content_json.panels] }
    currentStoryId.value = story.id
    publishedStoryId.value = story.published ? story.id : null
    console.log('[stories] opened story', { id: story.id, title: story.title })
  } catch (error) {
    console.error('[stories] failed opening story', error)
  } finally {
    isOpeningStory.value = false
  }
}

watch(
  () => user.value?.id ?? null,
  async (nextUserId) => {
    if (!nextUserId) {
      myStories.value = []
      currentStoryId.value = null
      publishedStoryId.value = null
      return
    }
    await refreshMyStories()
  },
  { immediate: true }
)

const openSlideEditor = (index: number) => {
  activeSlideIndex.value = index
  flowEditorRef.value?.openSlideSettings(index)
}

const handleEditCurrentSlide = () => {
  const total = panelsState.value.length
  if (!total) return
  const safeIndex = Math.max(0, Math.min(activeSlideIndex.value, total - 1))
  flowEditorRef.value?.openSlideSettings(safeIndex)
}

const handleToggleEditor = () => {
  const next = flowEditorRef.value?.toggleFlowEditor()
  if (typeof next === 'boolean') {
    isFlowEditorOpen.value = next
    return
  }
  isFlowEditorOpen.value = !isFlowEditorOpen.value
}

const setSnapShellEl = (element: HTMLElement | null) => {
  if (snapShellScrollTarget && snapShellScrollHandler) {
    snapShellScrollTarget.removeEventListener('scroll', snapShellScrollHandler)
    snapShellScrollTarget = null
    snapShellScrollHandler = null
  }

  snapShellRef.value = element

  if (!element) return
  snapShellScrollTarget = element
  snapShellScrollHandler = () => {
    const viewport = window.innerHeight || 1
    const index = Math.round(element.scrollTop / viewport)
    activeSlideIndex.value = Math.max(0, Math.min(index, panelsState.value.length - 1))
  }
  element.addEventListener('scroll', snapShellScrollHandler, { passive: true })
}

const setSnapStageEl = (element: HTMLElement | null) => {
  snapStageRef.value = element
}

onMounted(() => {
  isFlowEditorOpen.value = flowEditorRef.value?.isFlowEditorOpen() ?? true
  document.addEventListener('mousedown', handleDocumentPointerDown)
  document.addEventListener('touchstart', handleDocumentPointerDown, { passive: true })
})

onUnmounted(() => {
  if (snapShellScrollTarget && snapShellScrollHandler) {
    snapShellScrollTarget.removeEventListener('scroll', snapShellScrollHandler)
  }
  document.removeEventListener('mousedown', handleDocumentPointerDown)
  document.removeEventListener('touchstart', handleDocumentPointerDown)
})
</script>




