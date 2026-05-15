<template>
  <main class="sandbox">
    <div class="top-controls">
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
import type { ContentSchema } from '../types/navigation'

const route = useRoute()
const storySchema = ref<ContentSchema | null>(null)
const availableStories = ref<string[]>([])

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
    } catch (error) {
      console.warn(`[edit] Failed to load story "${storyId}"`, error)
      storySchema.value = { panels: [] }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  availableStories.value = await listStories()
})

const { user, loading, signInWithGoogle, signOut } = useAuth()

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
.top-controls {
  position: fixed;
  top: 12px;
  left: 188px;
  z-index: 1002;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 36px;
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

.google-login-button {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  height: 36px;
  padding: 0 0.95rem;
  border: 1px solid #d6dee7;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.96);
  color: #24303c;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.79rem;
  letter-spacing: 0.01em;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
  transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease, border-color 0.16s ease;
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

.google-login-button:hover {
  transform: translateY(-1px);
  border-color: #b9c4cf;
  background: #ffffff;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.2);
}

.google-login-button:focus-visible {
  outline: 2px solid #9fb3c8;
  outline-offset: 2px;
}

.google-login-button:disabled {
  cursor: default;
  opacity: 0.7;
  transform: none;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
}

.google-login-button--logout {
  background: rgba(255, 246, 246, 0.96);
  border-color: #f0c8c8;
  color: #7b2d2d;
}

@media (max-width: 720px) {
  .top-controls {
    top: 56px;
    left: 12px;
  }
}
</style>
