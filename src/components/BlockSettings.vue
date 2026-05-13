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

      <div class="block-settings__actions">
        <button class="danger" @click="$emit('delete')">Delete Panel</button>
        <button @click="$emit('close')">Cancel</button>
        <button @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
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
  nextPanelPosition: 'down'
})

watch(
  () => props.panel,
  (panel) => {
    if (!panel) return
    draft.id = panel.id
    draft.title = panel.title
    draft.eyebrow = panel.eyebrow
    draft.panelClass = panel.panelClass
    draft.nextPanelPosition = panel.nextPanelPosition ?? 'down'
  },
  { immediate: true }
)

const save = () => {
  emit('save', { ...draft })
}
</script>
