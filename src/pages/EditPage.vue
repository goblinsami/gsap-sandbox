<template>
  <main class="sandbox">
    <aside class="control-panel">
      <details class="panel-card panel-card--account collapsible" open>
        <summary class="collapsible__summary">Account</summary>
        <div class="auth-chip">
          <span class="auth-chip__label">Auth</span>
          <span v-if="loading" class="auth-chip__status">Loading...</span>
          <span v-else-if="user?.email" class="auth-chip__status">{{ user.email }}</span>
          <span v-else class="auth-chip__status">Not signed in</span>
        </div>
        <button
          v-if="!user"
          class="google-login-button"
          type="button"
          :disabled="loading"
          @click="handleLogin"
        >
          <span class="google-login-button__icon" aria-hidden="true">G</span>
          <span class="google-login-button__text">Login with Google</span>
        </button>
        <button
          v-else
          class="google-login-button google-login-button--logout"
          type="button"
          :disabled="loading"
          @click="handleLogout"
        >
          <span class="google-login-button__text">Logout</span>
        </button>
      </details>

      <details v-if="user" class="panel-card panel-card--actions collapsible">
        <summary class="collapsible__summary">Actions</summary>
        <div class="panel-actions">
          <button
            class="save-story-button"
            type="button"
            :disabled="loading || isSavingStory || !user"
            @click="handleSaveStory"
          >
            <span v-if="isSavingStory">Saving...</span>
            <span v-else>Save Story</span>
          </button>

          <button
            class="publish-story-button"
            type="button"
            :disabled="loading || isPublishingStory || !user"
            @click="handlePublishStory"
          >
            <span v-if="isPublishingStory">Publishing...</span>
            <span v-else>Publish Story</span>
          </button>
        </div>
        <details class="nested-collapsible" open>
          <summary class="nested-collapsible__summary">Share</summary>
          <div class="nested-collapsible__content">
            <p v-if="!publishedStoryId" class="share-box__hint">Publish a story to generate public link and iframe code.</p>
            <template v-else>
              <p class="share-box__line">{{ publicStoryUrl }}</p>
              <div class="share-box__actions">
                <button class="share-box__button" type="button" @click="copyPublicLink">Copy Public Link</button>
                <button class="share-box__button" type="button" @click="copyEmbedCode">Copy iFrame Code</button>
              </div>
              <p v-if="shareFeedback" class="share-box__feedback">{{ shareFeedback }}</p>
            </template>
          </div>
        </details>

        <details class="nested-collapsible my-stories" open>
          <summary class="nested-collapsible__summary">My Stories</summary>
          <div class="nested-collapsible__content">
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
                  Open Story
                </button>
              </li>
            </ul>
          </div>
        </details>
      </details>
    </aside>

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
      :show-edit-trigger="true"
      @edit-slide="openSlideEditor"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import '../styles/editor.css'
import FlowEditor from '../editor/components/flow-creator/FlowEditor.vue'
import StoryRenderer from '../core/StoryRenderer.vue'
import { useStoryRuntime } from '../core/useStoryRuntime'
import { listStories, loadStory } from '../core/storySource'
import { SNAP_EASE_OPTIONS } from '../constants/snapEase'
import { useAuth } from '../composables/useAuth'
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

const { user, loading, signInWithGoogle, signOut } = useAuth()
const isSavingStory = ref(false)
const isPublishingStory = ref(false)
const isLoadingStories = ref(false)
const isOpeningStory = ref(false)
const myStories = ref<StoryListItem[]>([])
const publishedStoryId = ref<string | null>(null)
const shareFeedback = ref('')

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

const flowEditorRef = ref<{ openSlideSettings: (index: number) => void } | null>(null)

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

  if (!user.value) {
    console.warn('[stories] Save cancelled: user is not authenticated.')
    return
  }

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
  if (!user.value) {
    console.warn('[stories] Publish cancelled: user is not authenticated.')
    return
  }

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
  flowEditorRef.value?.openSlideSettings(index)
}

const setSnapShellEl = (element: HTMLElement | null) => {
  snapShellRef.value = element
}

const setSnapStageEl = (element: HTMLElement | null) => {
  snapStageRef.value = element
}
</script>

<style scoped>
.control-panel {
  position: fixed;
  top: clamp(12px, 2.2vw, 20px);
  left: calc(clamp(12px, 2.2vw, 20px) + 122px);
  right: auto;
  z-index: 1500;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.6rem;
}

.panel-card {
  padding: 0.7rem;
  border-radius: 12px;
  border: 1px solid #d9e3ef;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.11);
  min-width: 220px;
  max-width: 340px;
  flex: 0 0 auto;
}

.panel-card--account {
  width: 280px;
}

.panel-card--actions {
  width: 340px;
}

.collapsible {
  overflow: hidden;
}

.collapsible__summary {
  cursor: pointer;
  list-style: none;
  font-size: 0.82rem;
  font-weight: 700;
  color: #233242;
  margin: -0.1rem 0 0.5rem;
}

.collapsible__summary::-webkit-details-marker {
  display: none;
}

.auth-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 36px;
  width: 100%;
  margin-bottom: 0.45rem;
  padding: 0 0.75rem;
  border: 1px solid #d6dee7;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  color: #24303c;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.auth-chip__label {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #627485;
  font-weight: 700;
}

.auth-chip__status {
  font-size: 0.77rem;
  font-weight: 600;
  color: #1f2d3b;
}

.panel-actions {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 0.2rem;
}

.save-story-button,
.publish-story-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  height: 36px;
  width: 100%;
  padding: 0 0.95rem;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.79rem;
  letter-spacing: 0.01em;
}

.google-login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  height: 36px;
  width: auto;
  min-width: 160px;
  padding: 0 0.95rem;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.79rem;
  letter-spacing: 0.01em;
}

.google-login-button {
  border: 1px solid #d6dee7;
  background: rgba(255, 255, 255, 0.96);
  color: #24303c;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}

.google-login-button__icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #4285f4;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
}

.google-login-button--logout {
  background: rgba(255, 246, 246, 0.96);
  border: 1px solid #f0c8c8;
  color: #7b2d2d;
}

.save-story-button {
  border: 1px solid #bcd1c3;
  background: rgba(235, 250, 241, 0.96);
  color: #1d5e3c;
}

.publish-story-button {
  border: 1px solid #c8c5f1;
  background: rgba(238, 236, 255, 0.96);
  color: #3c2e7a;
}

.google-login-button:disabled,
.save-story-button:disabled,
.publish-story-button:disabled,
.my-stories__open-button:disabled {
  cursor: default;
  opacity: 0.68;
}

.share-box__hint,
.share-box__line,
.my-stories__hint {
  margin: 0;
  font-size: 0.73rem;
  color: #3c4f62;
  word-break: break-all;
}

.share-box__actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.4rem;
}

.share-box__button,
.my-stories__open-button {
  border: 1px solid #c8d6e7;
  background: #f4f8fc;
  color: #2e4862;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}

.share-box__feedback {
  margin: 0.45rem 0 0;
  font-size: 0.7rem;
  color: #265e3e;
}

.my-stories__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nested-collapsible {
  margin-top: 0.8rem;
  border-top: 1px solid #e7edf4;
  padding-top: 0.6rem;
}

.nested-collapsible__summary {
  cursor: pointer;
  list-style: none;
  font-size: 0.76rem;
  font-weight: 700;
  color: #314659;
}

.nested-collapsible__summary::-webkit-details-marker {
  display: none;
}

.nested-collapsible__content {
  margin-top: 0.5rem;
}

.my-stories__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid #e4ebf3;
  border-radius: 8px;
  padding: 0.45rem;
}

.my-stories__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.my-stories__story-title {
  font-size: 0.74rem;
  color: #1c2a38;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.my-stories__date {
  font-size: 0.68rem;
  color: #6f8092;
}

@media (max-width: 720px) {
  .control-panel {
    top: calc(clamp(12px, 2.2vw, 20px) + 42px);
    left: clamp(12px, 2.2vw, 20px);
    right: auto;
    flex-direction: column;
  }

  .panel-actions {
    flex-direction: column;
  }
}
</style>

