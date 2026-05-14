<template>
  <main class="sandbox">
    <FlowEditor
      :panels="panelsState"
      :snap-ease="snapEase"
      :ease-options="SNAP_EASE_OPTIONS"
      @update:panels="handlePanelsUpdate"
      @update:snap-ease="handleSnapEaseUpdate"
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
          <Slide
            :title="step.panel.title"
            :eyebrow="step.panel.eyebrow"
            :description="step.panel.description"
            :use-markdown="step.panel.useMarkdown"
            :title-size="step.panel.titleSize"
            :eyebrow-size="step.panel.eyebrowSize"
            :description-size="step.panel.descriptionSize"
            :panel-class="step.panel.panelClass"
            :image="step.panel.image"
            :direction="step.directionToNext"
            animate-key="intro"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import Slide from './components/Slide.vue'
import FlowEditor from './components/flow-creator/FlowEditor.vue'
import { usePresentationFlow } from './composables/usePresentationFlow'

const {
  autoSnapEnabled,
  flowSteps,
  panelsState,
  snapEase,
  snapShellRef,
  snapStageRef,
  stepStyle,
  easeOptions: SNAP_EASE_OPTIONS,
  handlePanelsUpdate,
  handleSnapEaseUpdate
} = usePresentationFlow()

void snapShellRef
void snapStageRef
</script>
