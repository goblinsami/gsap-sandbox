<template>
  <section class="flow-creator">
    <button class="flow-toggle" @click="toggleModal">
      <h3>Flow Editor</h3>
    </button>

    <div v-if="showModal" class="flow-modal-overlay" @click.self="toggleModal">
      <div class="flow-modal flow-modal--resizable" :style="modalStyle">
        <div class="flow-modal__debug">
          <button @click="forceScrollToBottom">Debug: Scroll Bottom</button>
          <button @click="exportFlowJson">Export JSON</button>
          <select v-model="selectedEase" @change="emitSnapEase">
            <option v-for="ease in easeOptions" :key="ease" :value="ease">
              {{ ease }}
            </option>
          </select>
          <select v-model="selectedDataFile" @change="importSelectedDataFile">
            <option value="">Select data file</option>
            <option v-for="file in dataFiles" :key="file.path" :value="file.path">
              {{ file.name }}
            </option>
          </select>
          <input type="file" accept=".json,application/json" @change="onJsonFileChange" />
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

              <FlowNodeCard :panel="node.panel" :index="node.index" />

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

    <SlidePropertiesModal
      :open="showSettings"
      :panel="selectedPanel"
      @close="closeSettings"
      @save="saveSettings"
      @delete="deletePanel"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import FlowNodeCard from './FlowNodeCard.vue'
import SlidePropertiesModal from './SlidePropertiesModal.vue'
import type { Panel } from '../../types/navigation'
import { useFlowEditor } from '../../composables/useFlowEditor'

const props = defineProps<{
  panels: Panel[]
  snapEase: string
  easeOptions: readonly string[]
}>()

const emit = defineEmits<{
  'update:panels': [panels: Panel[]]
  'update:snapEase': [ease: string]
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
  exportFlowJson,
  importFlowObject,
  importFlowFromFile,
  insertableDirections,
  insertAfter
} = useFlowEditor(toRef(props, 'panels'), (panels) => emit('update:panels', panels))

const dataFileModules = import.meta.glob('../../data/**/*.json', { eager: true }) as Record<
  string,
  { default: unknown }
>

const dataFiles = computed(() =>
  Object.entries(dataFileModules)
    .map(([path, module]) => ({
      path,
      name: path.replace('../../data/', ''),
      data: module.default
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
)

const selectedDataFile = ref('')
const selectedEase = ref(props.snapEase)

watch(
  () => props.snapEase,
  (value) => {
    selectedEase.value = value
  }
)

const emitSnapEase = () => {
  emit('update:snapEase', selectedEase.value)
}

const importSelectedDataFile = () => {
  if (!selectedDataFile.value) return
  const selected = dataFiles.value.find((file) => file.path === selectedDataFile.value)
  if (!selected) return
  importFlowObject(selected.data)
}

const onJsonFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await importFlowFromFile(file)
  input.value = ''
}

void canvasRef
</script>
