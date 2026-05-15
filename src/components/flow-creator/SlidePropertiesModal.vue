<template>
  <div
    v-if="open"
    class="block-settings-overlay"
    :class="`block-settings-overlay--${side}`"
    @click.self="$emit('close')"
  >
    <div class="block-settings">
      <h4>Slide Properties</h4>

      <section class="text-style-panel">
        <div
          class="text-style-panel__summary"
          role="button"
          tabindex="0"
          :aria-expanded="isTextContentOpen ? 'true' : 'false'"
          aria-controls="text-content-panel-body"
          @click="toggleTextContentPanel"
          @keydown.enter.prevent="toggleTextContentPanel"
          @keydown.space.prevent="toggleTextContentPanel"
        >
          <span class="text-style-panel__title">Text Content</span>
          <span
            class="text-style-panel__chevron"
            :class="{ 'text-style-panel__chevron--open': isTextContentOpen }"
            aria-hidden="true"
          >
            ▸
          </span>
        </div>
        <div
          v-show="isTextContentOpen"
          id="text-content-panel-body"
          class="text-style-panel__body text-content-panel__body"
        >
          <label>
            Name
            <div class="text-input-row">
              <input v-if="!draft.useMarkdown" v-model="draft.title" type="text" @input="save" />
              <MarkdownField
                v-else
                :model-value="draft.title"
                :rows="3"
                @update:model-value="(value) => { draft.title = value; save() }"
              />
              <TextSizeSelector
                :model-value="draft.titleSize ?? DEFAULT_TEXT_SIZE"
                @update:model-value="(value) => { draft.titleSize = value; save() }"
              />
            </div>
          </label>

          <label>
            Eyebrow
            <div class="text-input-row">
              <input v-if="!draft.useMarkdown" v-model="draft.eyebrow" type="text" @input="save" />
              <MarkdownField
                v-else
                :model-value="draft.eyebrow"
                :rows="2"
                @update:model-value="(value) => { draft.eyebrow = value; save() }"
              />
              <TextSizeSelector
                :model-value="draft.eyebrowSize ?? DEFAULT_TEXT_SIZE"
                @update:model-value="(value) => { draft.eyebrowSize = value; save() }"
              />
            </div>
          </label>

          <label>
            Description
            <div class="text-input-row">
              <textarea v-if="!draft.useMarkdown" v-model="draft.description" rows="3" @input="save" />
              <MarkdownField
                v-else
                :model-value="draft.description ?? ''"
                :rows="6"
                @update:model-value="(value) => { draft.description = value; save() }"
              />
              <TextSizeSelector
                :model-value="draft.descriptionSize ?? DEFAULT_TEXT_SIZE"
                @update:model-value="(value) => { draft.descriptionSize = value; save() }"
              />
            </div>
          </label>

          <label class="block-settings__toggle">
            <div class="block-settings__toggle-row">
              <input
                v-model="draft.useMarkdown"
                type="checkbox"
                class="block-settings__toggle-input"
                @change="save"
              />
              <span class="block-settings__toggle-switch" aria-hidden="true" />
              <span class="block-settings__toggle-text">Enable markdown</span>
            </div>
          </label>

          <label>
            Text Align
            <select v-model="draft.contentAlign" @change="save">
              <option
                v-for="option in contentAlignOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="block-settings__toggle">
            <span>Content Width</span>
            <div class="block-settings__toggle-row">
              <input
                :checked="isContentWidthContained"
                type="checkbox"
                class="block-settings__toggle-input"
                @change="onContentWidthModeToggle"
              />
              <span class="block-settings__toggle-switch" aria-hidden="true" />
              <span class="block-settings__toggle-text">
                {{ isContentWidthContained ? 'Contained' : 'Expanded (light padding)' }}
              </span>
            </div>
          </label>
        </div>
      </section>

      <section class="text-style-panel">
        <div
          class="text-style-panel__summary"
          role="button"
          tabindex="0"
          :aria-expanded="isTextStyleOpen ? 'true' : 'false'"
          aria-controls="text-style-panel-body"
          @click="toggleTextStylePanel"
          @keydown.enter.prevent="toggleTextStylePanel"
          @keydown.space.prevent="toggleTextStylePanel"
        >
          <span class="text-style-panel__title">Text Style</span>
          <span
            class="text-style-panel__chevron"
            :class="{ 'text-style-panel__chevron--open': isTextStyleOpen }"
            aria-hidden="true"
          >
            ▸
          </span>
        </div>
        <div
          v-show="isTextStyleOpen"
          id="text-style-panel-body"
          class="text-style-panel__body"
        >
          <div class="text-style-panel__grid">
            <label class="text-style-panel__field text-style-panel__field--wide">
              <span>Text gap</span>
              <div class="text-style-panel__range">
                <input
                  :value="textGapValue"
                  type="range"
                  :min="textStyleRanges.textGap.min"
                  :max="textStyleRanges.textGap.max"
                  :step="textStyleRanges.textGap.step"
                  @input="onTextGapInput"
                />
                <span>{{ formatNumber(textGapValue, 0) }}px</span>
              </div>
            </label>

            <label class="text-style-panel__field">
              <span>Title line</span>
              <div class="text-style-panel__range">
                <input
                  v-model.number="draft.titleLineHeight"
                  type="range"
                  :min="textStyleRanges.titleLineHeight.min"
                  :max="textStyleRanges.titleLineHeight.max"
                  :step="textStyleRanges.titleLineHeight.step"
                  @input="save"
                />
                <span>{{ formatNumber(draft.titleLineHeight, 2) }}</span>
              </div>
            </label>

            <label class="text-style-panel__field">
              <span>Subtitle line</span>
              <div class="text-style-panel__range">
                <input
                  v-model.number="draft.descriptionLineHeight"
                  type="range"
                  :min="textStyleRanges.descriptionLineHeight.min"
                  :max="textStyleRanges.descriptionLineHeight.max"
                  :step="textStyleRanges.descriptionLineHeight.step"
                  @input="save"
                />
                <span>{{ formatNumber(draft.descriptionLineHeight, 2) }}</span>
              </div>
            </label>

            <label class="text-style-panel__field">
              <span>Eyebrow spacing</span>
              <div class="text-style-panel__range">
                <input
                  v-model.number="draft.eyebrowLetterSpacing"
                  type="range"
                  :min="textStyleRanges.eyebrowLetterSpacing.min"
                  :max="textStyleRanges.eyebrowLetterSpacing.max"
                  :step="textStyleRanges.eyebrowLetterSpacing.step"
                  @input="save"
                />
                <span>{{ formatNumber(draft.eyebrowLetterSpacing, 2) }}em</span>
              </div>
            </label>

            <label class="text-style-panel__field">
              <span>Content width</span>
              <div class="text-style-panel__range">
                <input
                  v-model.number="draft.contentMaxWidth"
                  type="range"
                  :min="textStyleRanges.contentMaxWidth.min"
                  :max="textStyleRanges.contentMaxWidth.max"
                  :step="textStyleRanges.contentMaxWidth.step"
                  @input="save"
                />
                <span>{{ formatNumber(draft.contentMaxWidth, 0) }}px</span>
              </div>
            </label>

            <label class="text-style-panel__field">
              <span>Title width</span>
              <div class="text-style-panel__range">
                <input
                  v-model.number="draft.titleMaxWidth"
                  type="range"
                  :min="textStyleRanges.titleMaxWidth.min"
                  :max="textStyleRanges.titleMaxWidth.max"
                  :step="textStyleRanges.titleMaxWidth.step"
                  @input="save"
                />
                <span>{{ formatNumber(draft.titleMaxWidth, 0) }}px</span>
              </div>
            </label>

            <label class="text-style-panel__field">
              <span>Subtitle width</span>
              <div class="text-style-panel__range">
                <input
                  v-model.number="draft.descriptionMaxWidth"
                  type="range"
                  :min="textStyleRanges.descriptionMaxWidth.min"
                  :max="textStyleRanges.descriptionMaxWidth.max"
                  :step="textStyleRanges.descriptionMaxWidth.step"
                  @input="save"
                />
                <span>{{ formatNumber(draft.descriptionMaxWidth, 0) }}px</span>
              </div>
            </label>
          </div>
        </div>
      </section>

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
        Slide Logo
        <div class="logo-row">
          <input
            v-model="draft.logo"
            type="text"
            :placeholder="DROP_LOGO_EMPTY_TEXT"
            @input="save"
          />
          <input
            ref="logoFileInputRef"
            type="file"
            accept="image/*"
            class="image-dropzone__input"
            @change="onLogoFileChange"
          />
          <div class="logo-row__actions">
            <button type="button" @click="openLogoFilePicker">Choose Logo</button>
            <button v-if="draft.logo" type="button" @click="clearLogo">Remove</button>
          </div>
          <label class="block-settings__toggle">
            <div class="block-settings__toggle-row">
              <input
                v-model="draft.logoTintEnabled"
                type="checkbox"
                class="block-settings__toggle-input"
                :disabled="!draft.logo"
                @change="save"
              />
              <span class="block-settings__toggle-switch" aria-hidden="true" />
              <span class="block-settings__toggle-text">Tint logo</span>
            </div>
          </label>
          <div class="logo-row__tint">
            <input
              v-model="draft.logoTintColor"
              type="color"
              :disabled="!draft.logo || !draft.logoTintEnabled"
              @input="save"
            />
            <input
              v-model="draft.logoTintColor"
              type="text"
              :disabled="!draft.logo || !draft.logoTintEnabled"
              :placeholder="DEFAULT_LOGO_TINT_COLOR"
              @input="save"
            />
          </div>
          <small>{{ draft.logo ? DROP_LOGO_LOADED_TEXT : 'No logo (default)' }}</small>
        </div>
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

      <label>
        Image Overlay
        <div class="overlay-controls">
          <label class="block-settings__toggle">
            <div class="block-settings__toggle-row">
              <input
                v-model="draft.overlayEnabled"
                type="checkbox"
                class="block-settings__toggle-input"
                :disabled="!draft.image"
                @change="save"
              />
              <span class="block-settings__toggle-switch" aria-hidden="true" />
              <span class="block-settings__toggle-text">
                {{ draft.image ? 'Show overlay' : 'Add image to enable' }}
              </span>
            </div>
          </label>
          <div class="overlay-intensity">
            <input
              v-model.number="draft.overlayIntensity"
              type="range"
              min="0"
              max="100"
              step="1"
              :disabled="!draft.image || !draft.overlayEnabled"
              @input="save"
            />
            <span>{{ Math.max(0, Math.min(100, Number(draft.overlayIntensity ?? 55))) }}%</span>
          </div>
        </div>
      </label>

      <div class="block-settings__actions">
        <button class="danger" @click="deleteAndClose">Delete Panel</button>
        <button @click="cancelAndClose">Cancel</button>
        <button @click="saveAndClose">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { ContentWidthMode, TextSize, type Panel } from '../../types/navigation'
import TextSizeSelector from '../atoms/TextSizeSelector.vue'
import MarkdownField from '../atoms/MarkdownField.vue'
import {
  DEFAULT_LOGO_TINT_COLOR,
  contentAlignOptions,
  DROP_IMAGE_EMPTY_TEXT,
  DROP_IMAGE_LOADED_TEXT,
  DROP_LOGO_EMPTY_TEXT,
  DROP_LOGO_LOADED_TEXT,
  panelClassOptions,
  textStyleRanges,
  useSlidePropertiesForm
} from '../../composables/useSlidePropertiesForm'

const props = withDefaults(
  defineProps<{
    open: boolean
    panel: Panel | null
    side?: 'left' | 'right'
  }>(),
  {
    side: 'left'
  }
)

const emit = defineEmits<{
  close: []
  save: [panel: Panel]
  delete: []
}>()

const DEFAULT_TEXT_SIZE = TextSize.Medium
const originalPanelSnapshot = ref<Panel | null>(null)

const {
  draft,
  fileInputRef,
  logoFileInputRef,
  isDragging,
  openFilePicker,
  openLogoFilePicker,
  onFileChange,
  onLogoFileChange,
  onDropImage,
  clearImage,
  clearLogo,
  setRandomImage,
  save,
  resetDraft
} = useSlidePropertiesForm({
  panelRef: toRef(props, 'panel'),
  emitSave: (panel) => emit('save', panel)
})

const isContentWidthContained = computed(() => draft.contentWidthMode !== ContentWidthMode.Full)

const onContentWidthModeToggle = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  draft.contentWidthMode = checked ? ContentWidthMode.Contained : ContentWidthMode.Full
  save()
}

const textGapValue = computed(() => Number(draft.eyebrowTitleGap ?? draft.titleDescriptionGap ?? 24))
const isTextContentOpen = ref(true)
const isTextStyleOpen = ref(false)

const toggleTextContentPanel = () => {
  isTextContentOpen.value = !isTextContentOpen.value
}

const toggleTextStylePanel = () => {
  isTextStyleOpen.value = !isTextStyleOpen.value
}

const onTextGapInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  draft.eyebrowTitleGap = value
  draft.titleDescriptionGap = value
  save()
}

const formatNumber = (value: number | undefined, digits: number) => Number(value ?? 0).toFixed(digits)

const saveAndClose = () => {
  save()
  emit('close')
}

const cancelAndClose = () => {
  if (originalPanelSnapshot.value) {
    emit('save', { ...originalPanelSnapshot.value })
  } else {
    resetDraft()
  }
  emit('close')
}

const deleteAndClose = () => {
  emit('delete')
  emit('close')
}

watch(
  () => props.open,
  (isOpen, wasOpen) => {
    if (!isOpen || wasOpen || !props.panel) return
    originalPanelSnapshot.value = { ...props.panel }
  }
)

watch(
  () => props.panel?.id,
  (nextId, prevId) => {
    if (!props.open || !nextId || nextId === prevId || !props.panel) return
    originalPanelSnapshot.value = { ...props.panel }
  }
)

void fileInputRef
void logoFileInputRef
</script>
