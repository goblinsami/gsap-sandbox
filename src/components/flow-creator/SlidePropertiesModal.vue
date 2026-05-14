<template>
  <div v-if="open" class="block-settings-overlay">
    <div class="block-settings">
      <h4>Slide Properties</h4>

      <label>
        Name
        <div class="text-input-row">
          <input v-if="!draft.useMarkdown" v-model="draft.title" type="text" />
          <MarkdownField v-else v-model="draft.title" :rows="3" />
          <TextSizeSelector
            :model-value="draft.titleSize ?? 'm'"
            @update:model-value="(value) => { draft.titleSize = value; save() }"
          />
        </div>
      </label>

      <label>
        Eyebrow
        <div class="text-input-row">
          <input v-if="!draft.useMarkdown" v-model="draft.eyebrow" type="text" />
          <MarkdownField v-else v-model="draft.eyebrow" :rows="2" />
          <TextSizeSelector
            :model-value="draft.eyebrowSize ?? 'm'"
            @update:model-value="(value) => { draft.eyebrowSize = value; save() }"
          />
        </div>
      </label>

      <label>
        Description
        <div class="text-input-row">
          <textarea v-if="!draft.useMarkdown" v-model="draft.description" rows="3" />
          <MarkdownField
            v-else
            :model-value="draft.description ?? ''"
            :rows="6"
            @update:model-value="(value) => { draft.description = value; save() }"
          />
          <TextSizeSelector
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
import { toRef } from 'vue'
import type { Panel } from '../../types/navigation'
import TextSizeSelector from '../atoms/TextSizeSelector.vue'
import MarkdownField from '../atoms/MarkdownField.vue'
import {
  DROP_IMAGE_EMPTY_TEXT,
  DROP_IMAGE_LOADED_TEXT,
  panelClassOptions,
  useSlidePropertiesForm
} from '../../composables/useSlidePropertiesForm'

const props = defineProps<{
  open: boolean
  panel: Panel | null
}>()

const emit = defineEmits<{
  close: []
  save: [panel: Panel]
  delete: []
}>()

const {
  draft,
  fileInputRef,
  isDragging,
  openFilePicker,
  onFileChange,
  onDropImage,
  clearImage,
  setRandomImage,
  save,
  resetDraft
} = useSlidePropertiesForm({
  panelRef: toRef(props, 'panel'),
  emitSave: (panel) => emit('save', panel)
})

void fileInputRef
</script>
