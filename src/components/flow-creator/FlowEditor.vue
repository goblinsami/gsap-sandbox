<template>
  <section class="flow-creator" :class="{ 'flow-creator--desktop': isDesktop, 'flow-creator--settings-open': showSettings }">
    <button class="flow-toggle" @click="toggleModal">
      <h3>{{ showModal ? 'Hide Flow Editor' : 'Flow Editor' }}</h3>
    </button>

    <div v-if="showModal" class="flow-sidebar-overlay" @click="toggleModal" />

    <aside
      class="flow-sidebar flow-modal flow-modal--resizable"
      :class="{ 'flow-sidebar--open': showModal }"
    >
      <div class="flow-modal__debug">
        <div class="flow-controls-row flow-controls-row--top">
          <div class="flow-controls-group flow-controls-group--fields">
            <label class="flow-field-group" for="snap-ease-select">
              <span class="flow-field-label">Snap ease</span>
              <select id="snap-ease-select" v-model="selectedEase" class="flow-field-select" @change="emitSnapEase">
                <option v-for="ease in easeOptions" :key="ease" :value="ease">
                  {{ ease }}
                </option>
              </select>
            </label>
            <div class="flow-field-group flow-field-group--toggle">
              <span class="flow-field-label">Enable loop</span>
              <label class="flow-switch" for="loop-enabled-toggle">
                <input
                  id="loop-enabled-toggle"
                  v-model="selectedLoopEnabled"
                  type="checkbox"
                  class="flow-switch__input"
                  role="switch"
                  @change="emitLoopEnabled"
                />
                <span class="flow-switch__track" aria-hidden="true" />
              </label>
            </div>
          </div>
          <div class="flow-controls-group flow-controls-group--actions">
            <button @click="exportFlowJson">Export JSON</button>
            <button type="button" @click="openJsonFilePicker">Import JSON</button>
          </div>
        </div>

        <div class="flow-controls-row flow-controls-row--bottom">
          <label class="flow-field-group flow-field-group--data" for="data-file-select">
            <span class="flow-field-label">Data file</span>
            <select
              id="data-file-select"
              v-model="selectedDataFile"
              class="flow-field-select"
              @change="importSelectedDataFile"
            >
              <option value="">Select data file</option>
              <option v-for="file in dataFiles" :key="file.path" :value="file.path">
                {{ file.name }}
              </option>
            </select>
          </label>
        </div>

        <input
          ref="jsonFileInputRef"
          type="file"
          class="flow-file-input"
          accept=".json,application/json"
          @change="onJsonFileChange"
        />
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
            @click="handleNodeClick(node.index)"
          >
            <button
              class="flow-node__delete"
              title="Delete panel"
              @click.stop="deletePanelAt(node.index)"
            >
              &times;
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
    </aside>

    <SlidePropertiesModal
      :open="showSettings"
      :panel="selectedPanel"
      :side="slideSettingsSide"
      @close="closeSettings"
      @save="saveSettings"
      @delete="deletePanel"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import FlowNodeCard from './FlowNodeCard.vue'
import SlidePropertiesModal from './SlidePropertiesModal.vue'
import { ContentAlign, type ContentSchema, type Panel } from '../../types/navigation'
import { useFlowEditor } from '../../composables/useFlowEditor'
import { applyWelcomeGradientsToContent } from '../../utils/welcomeGradients'

const props = defineProps<{
  panels: Panel[]
  snapEase: string
  loopEnabled: boolean
  easeOptions: readonly string[]
}>()

const emit = defineEmits<{
  'update:panels': [panels: Panel[]]
  'update:snapEase': [ease: string]
  'update:loopEnabled': [enabled: boolean]
  focusStep: [index: number]
}>()

const {
  showModal,
  canvasRef,
  showSettings,
  positionedPanels,
  canvasStyle,
  stageStyle,
  flowLinks,
  selectedPanel,
  toggleModal,
  nodeStyle,
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
const selectedLoopEnabled = ref(props.loopEnabled)
const isDesktop = ref(false)
const jsonFileInputRef = ref<HTMLInputElement | null>(null)

const DESKTOP_BREAKPOINT_QUERY = '(min-width: 1024px)'

const applyViewportMode = () => {
  const desktop = window.matchMedia(DESKTOP_BREAKPOINT_QUERY).matches
  const wasDesktop = isDesktop.value
  isDesktop.value = desktop

  if (desktop && !wasDesktop) {
    showModal.value = true
  }
}

onMounted(() => {
  applyViewportMode()
  window.addEventListener('resize', applyViewportMode)
})

onUnmounted(() => {
  window.removeEventListener('resize', applyViewportMode)
})

watch(
  () => props.snapEase,
  (value) => {
    selectedEase.value = value
  }
)

watch(
  () => props.loopEnabled,
  (value) => {
    selectedLoopEnabled.value = value
  }
)

const emitSnapEase = () => {
  emit('update:snapEase', selectedEase.value)
}

const emitLoopEnabled = () => {
  emit('update:loopEnabled', selectedLoopEnabled.value)
}

const handleNodeClick = (index: number) => {
  emit('focusStep', index)
  openSettings(index)
}

const slideSettingsSide = computed<'left' | 'right'>(() => {
  const align = selectedPanel.value?.contentAlign
  if (align === ContentAlign.Left) return 'right'
  if (align === ContentAlign.Right) return 'left'
  return 'right'
})

const importSelectedDataFile = () => {
  if (!selectedDataFile.value) return
  const selected = dataFiles.value.find((file) => file.path === selectedDataFile.value)
  if (!selected) return
  const nextData =
    selected.name.toLowerCase() === 'welcome.json'
      ? applyWelcomeGradientsToContent(selected.data as ContentSchema)
      : selected.data
  importFlowObject(nextData)
}

const onJsonFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await importFlowFromFile(file)
  input.value = ''
}

const openJsonFilePicker = () => {
  jsonFileInputRef.value?.click()
}

const openSlideSettings = (index: number) => {
  if (index < 0 || index >= props.panels.length) return
  openSettings(index)
}

defineExpose({
  openSlideSettings
})

void canvasRef
</script>
