<template>
  <section class="flow-creator">
    <button class="flow-toggle" @click="toggleModal">
      <h3>Flow Creator</h3>
    </button>

    <div v-if="showModal" class="flow-modal-overlay" @click.self="toggleModal">
      <div class="flow-modal flow-modal--resizable" :style="modalStyle">
        <div class="flow-modal__debug">
          <button @click="forceScrollToBottom">Debug: Scroll Bottom</button>
        </div>

        <div ref="canvasRef" class="flow-canvas" :style="canvasStyle">
          <div class="flow-stage" :style="stageStyle">
            <div class="flow-links">
              <div
                v-for="link in flowLinks"
                :key="link.id"
                class="flow-link"
                :style="link.style"
              />
            </div>

            <div
              v-for="node in positionedPanels"
              :key="node.panel.id"
              class="flow-node"
              :data-panel-id="node.panel.id"
              :style="nodeStyle(node.x, node.y)"
              @click="openSettings(node.index)"
            >
              <button
                class="flow-node__delete"
                title="Delete panel"
                @click.stop="deletePanelAt(node.index)"
              >
                ×
              </button>

              <FlowBlock :block="node.panel" :index="node.index" />

              <button
                v-for="dir in insertableDirections(node.index)"
                :key="`${node.panel.id}-${dir}`"
                class="flow-handle"
                :class="`flow-handle--${dir}`"
                @click.stop="insertAfter(node.index, dir)"
                :title="`Insert ${dir}`"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BlockSettings
      :open="showSettings"
      :panel="selectedPanel"
      @close="closeSettings"
      @save="saveSettings"
      @delete="deletePanel"
    />
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import FlowBlock from './FlowBlock.vue'
import BlockSettings from './BlockSettings.vue'
import type { Panel } from '../types/navigation'
import { useFlowCreator } from '../composables/useFlowCreator'

const props = defineProps<{
  panels: Panel[]
}>()

const emit = defineEmits<{
  'update:panels': [panels: Panel[]]
}>()

const {
  showModal,
  canvasRef,
  showSettings,
  positionedPanels,
  canvasStyle,
  stageStyle,
  modalStyle,
  flowLinks,
  selectedPanel,
  toggleModal,
  nodeStyle,
  forceScrollToBottom,
  openSettings,
  closeSettings,
  saveSettings,
  deletePanel,
  deletePanelAt,
  insertableDirections,
  insertAfter
} = useFlowCreator(toRef(props, 'panels'), (panels) => emit('update:panels', panels))

void canvasRef
</script>
