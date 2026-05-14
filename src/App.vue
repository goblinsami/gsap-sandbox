<template>
  <main class="sandbox">
    <FlowEditor
      ref="flowEditorRef"
      :panels="panelsState"
      :snap-ease="snapEase"
      :loop-enabled="loopEnabled"
      :ease-options="SNAP_EASE_OPTIONS"
      @update:panels="handlePanelsUpdate"
      @update:snap-ease="handleSnapEaseUpdate"
      @update:loop-enabled="handleLoopEnabledUpdate"
      @focus-step="handleFocusStep"
    />

    <section ref="snapShellRef" class="snap-shell" :class="{ 'snap-shell--auto': autoSnapEnabled }">
      <div ref="snapStageRef" class="snap-stage">
        <div
          v-for="step in flowSteps"
          :key="step.panel.id"
          class="snap-step"
          :style="stepStyle(step)"
          :data-step-index="step.index"
        >
          <button
            class="slide-edit-trigger"
            type="button"
            @click="openSlideEditor(step.index)"
          >
            Edit Slide
          </button>
          <Slide
            :title="step.panel.title"
            :eyebrow="step.panel.eyebrow"
            :description="step.panel.description"
            :use-markdown="step.panel.useMarkdown"
            :title-size="step.panel.titleSize"
            :eyebrow-size="step.panel.eyebrowSize"
            :description-size="step.panel.descriptionSize"
            :content-align="step.panel.contentAlign"
            :content-width-mode="step.panel.contentWidthMode"
            :eyebrow-title-gap="step.panel.eyebrowTitleGap"
            :title-description-gap="step.panel.titleDescriptionGap"
            :title-line-height="step.panel.titleLineHeight"
            :description-line-height="step.panel.descriptionLineHeight"
            :eyebrow-letter-spacing="step.panel.eyebrowLetterSpacing"
            :content-max-width="step.panel.contentMaxWidth"
            :title-max-width="step.panel.titleMaxWidth"
            :description-max-width="step.panel.descriptionMaxWidth"
            :panel-class="step.panel.panelClass"
            :image="step.panel.image"
            :overlay-enabled="step.panel.overlayEnabled"
            :overlay-intensity="step.panel.overlayIntensity"
            :direction="step.directionToNext"
            animate-key="intro"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Slide from './components/Slide.vue'
import FlowEditor from './components/flow-creator/FlowEditor.vue'
import { usePresentationFlow } from './composables/usePresentationFlow'

const {
  autoSnapEnabled,
  flowSteps,
  loopEnabled,
  panelsState,
  snapEase,
  snapShellRef,
  snapStageRef,
  stepStyle,
  easeOptions: SNAP_EASE_OPTIONS,
  handlePanelsUpdate,
  handleSnapEaseUpdate,
  handleLoopEnabledUpdate,
  handleFocusStep
} = usePresentationFlow()

const flowEditorRef = ref<{ openSlideSettings: (index: number) => void } | null>(null)

const openSlideEditor = (index: number) => {
  flowEditorRef.value?.openSlideSettings(index)
}

void snapShellRef
void snapStageRef
</script>
