<template>
  <div v-if="open" class="block-settings-overlay">
    <div class="block-settings">
      <h4>Block Settings</h4>

      <label>
        Name
        <div class="text-input-row">
          <input v-if="!draft.useMarkdown" v-model="draft.title" type="text" />
          <MarkdownEditor v-else v-model="draft.title" :rows="3" />
          <TextSizePicker
            :model-value="draft.titleSize ?? 'm'"
            @update:model-value="(value) => { draft.titleSize = value; save() }"
          />
        </div>
      </label>

      <label>
        Eyebrow
        <div class="text-input-row">
          <input v-if="!draft.useMarkdown" v-model="draft.eyebrow" type="text" />
          <MarkdownEditor v-else v-model="draft.eyebrow" :rows="2" />
          <TextSizePicker
            :model-value="draft.eyebrowSize ?? 'm'"
            @update:model-value="(value) => { draft.eyebrowSize = value; save() }"
          />
        </div>
      </label>

      <label>
        Description
        <div class="text-input-row">
          <textarea v-if="!draft.useMarkdown" v-model="draft.description" rows="3" />
          <MarkdownEditor
            v-else
            :model-value="draft.description ?? ''"
            :rows="6"
            @update:model-value="(value) => { draft.description = value; save() }"
          />
          <TextSizePicker
            :model-value="draft.descriptionSize ?? 'm'"
            @update:model-value="(value) => { draft.descriptionSize = value; save() }"
          />
        </div>
      </label>

      <label class="block-settings__toggle">
        <input v-model="draft.useMarkdown" type="checkbox" @change="save" />
        Enable Markdown Editor for text fields
      </label>

      <label>
        Panel Class
        <select v-model="draft.panelClass" @change="save">
          <option
            v-for="option in panelClassOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label>
        Panel Image
        <div
          class="image-dropzone"
          :class="{ 'image-dropzone--active': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDropImage"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="image-dropzone__input"
            @change="onFileChange"
          />
          <div class="image-dropzone__content">
            <p>{{ draft.image ? DROP_IMAGE_LOADED_TEXT : DROP_IMAGE_EMPTY_TEXT }}</p>
            <div class="image-dropzone__actions">
              <button type="button" @click="openFilePicker">Choose Image</button>
              <button type="button" @click="setRandomImage">Random Image</button>
              <button v-if="draft.image" type="button" @click="clearImage">Remove</button>
            </div>
          </div>
        </div>
      </label>

      <div class="block-settings__actions">
        <button class="danger" @click="$emit('delete')">Delete Panel</button>
        <button @click="resetDraft">Cancel</button>
        <button @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Panel } from '../../types/navigation'
import TextSizePicker from '../atoms/TextSizePicker.vue'
import MarkdownEditor from '../atoms/MarkdownEditor.vue'

const panelClassOptions = [
  { value: '', label: 'Default' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'outro', label: 'Outro Blue' },
  { value: 'red', label: 'Red' },
  { value: 'danger', label: 'Danger' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'violet', label: 'Violet' },
  { value: 'amber', label: 'Amber' }
]

const DEFAULT_TEXT_SIZE = 'm' as const
const RANDOM_IMAGE_WIDTH = 2400
const RANDOM_IMAGE_HEIGHT = 1350
const RANDOM_IMAGE_BASE_URL = 'https://picsum.photos'
const DROP_IMAGE_LOADED_TEXT = 'Image loaded'
const DROP_IMAGE_EMPTY_TEXT = 'Drop image here or choose file'

const props = defineProps<{
  open: boolean
  panel: Panel | null
}>()

const emit = defineEmits<{
  close: []
  save: [panel: Panel]
  delete: []
}>()

const draft = reactive<Panel>({
  id: '',
  title: '',
  eyebrow: '',
  description: '',
  useMarkdown: false,
  titleSize: DEFAULT_TEXT_SIZE,
  eyebrowSize: DEFAULT_TEXT_SIZE,
  descriptionSize: DEFAULT_TEXT_SIZE,
  panelClass: '',
  image: '',
  nextPanelPosition: 'down'
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

watch(
  () => props.panel,
  (panel) => {
    if (!panel) return
    draft.id = panel.id
    draft.title = panel.title
    draft.eyebrow = panel.eyebrow
    draft.description = panel.description ?? ''
    draft.useMarkdown = panel.useMarkdown ?? false
    draft.titleSize = panel.titleSize ?? DEFAULT_TEXT_SIZE
    draft.eyebrowSize = panel.eyebrowSize ?? DEFAULT_TEXT_SIZE
    draft.descriptionSize = panel.descriptionSize ?? DEFAULT_TEXT_SIZE
    draft.panelClass = panel.panelClass
    draft.image = panel.image ?? ''
    draft.nextPanelPosition = panel.nextPanelPosition ?? 'down'
  },
  { immediate: true }
)

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const readImageFile = (file: File) => {
  if (!file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    draft.image = typeof reader.result === 'string' ? reader.result : ''
    save()
  }
  reader.readAsDataURL(file)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) readImageFile(file)
  target.value = ''
}

const onDropImage = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) readImageFile(file)
}

const clearImage = () => {
  draft.image = ''
  save()
}

const setRandomImage = () => {
  // Public random stock-like image service, landscape and high resolution.
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  draft.image = `${RANDOM_IMAGE_BASE_URL}/${RANDOM_IMAGE_WIDTH}/${RANDOM_IMAGE_HEIGHT}?random=${seed}`
  save()
}

const save = () => {
  emit('save', { ...draft })
}

const resetDraft = () => {
  const panel = props.panel
  if (!panel) return
  draft.id = panel.id
  draft.title = panel.title
  draft.eyebrow = panel.eyebrow
  draft.description = panel.description ?? ''
  draft.useMarkdown = panel.useMarkdown ?? false
  draft.titleSize = panel.titleSize ?? DEFAULT_TEXT_SIZE
  draft.eyebrowSize = panel.eyebrowSize ?? DEFAULT_TEXT_SIZE
  draft.descriptionSize = panel.descriptionSize ?? DEFAULT_TEXT_SIZE
  draft.panelClass = panel.panelClass
  draft.image = panel.image ?? ''
  draft.nextPanelPosition = panel.nextPanelPosition ?? 'down'
}
</script>
