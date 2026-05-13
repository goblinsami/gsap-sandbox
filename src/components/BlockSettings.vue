<template>
  <div v-if="open" class="block-settings-overlay" @click.self="$emit('close')">
    <div class="block-settings">
      <h4>Block Settings</h4>

      <label>
        Name
        <input v-model="draft.title" type="text" />
      </label>

      <label>
        Eyebrow
        <input v-model="draft.eyebrow" type="text" />
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
            <p>{{ draft.image ? 'Image loaded' : 'Drop image here or choose file' }}</p>
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
        <button @click="$emit('close')">Cancel</button>
        <button @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Panel } from '../types/navigation'

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
  draft.image = `https://picsum.photos/2400/1350?random=${seed}`
  save()
}

const save = () => {
  emit('save', { ...draft })
}
</script>
