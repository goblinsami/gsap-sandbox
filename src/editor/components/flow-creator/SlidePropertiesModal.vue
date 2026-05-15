<template>
  <div
    v-if="open"
    class="block-settings-overlay"
    :class="`block-settings-overlay--${side}`"
    @click.self="$emit('close')"
  >
    <div class="block-settings">
      <h4>Slide Properties</h4>

      <CollapsibleSection
        title="Text Content"
        panel-id="text-content-panel-body"
        :open="isTextContentOpen"
        body-class="text-style-panel__body text-content-panel__body"
        @toggle="togglePanel('textContent')"
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Text Style"
        panel-id="text-style-panel-body"
        :open="isTextStyleOpen"
        @toggle="togglePanel('textStyle')"
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
      </CollapsibleSection>

      <label>
        Slide Color
        <div class="logo-row__tint">
          <input
            v-model="draft.panelColor"
            type="color"
            @input="save"
          />
          <input
            v-model="draft.panelColor"
            type="text"
            :placeholder="DEFAULT_SLIDE_COLOR"
            @input="save"
          />
        </div>
      </label>

      <CollapsibleSection
        title="Gradient Editor"
        panel-id="gradient-editor-panel-body"
        :open="isGradientEditorOpen"
        body-class="text-style-panel__body gradient-editor"
        @toggle="togglePanel('gradientEditor')"
      >
          <label>
            Type
            <select v-model="gradientType" @change="applyGradient">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
            </select>
          </label>

          <label>
            Orientation
            <select v-model="gradientOrientation" @change="applyGradient">
              <option
                v-for="option in orientationOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="gradient-editor__colors">
            <label
              v-for="(_color, index) in gradientColors"
              :key="`gradient-color-${index}`"
            >
              Color {{ index + 1 }}
              <div class="logo-row__tint">
                <input
                  v-model="gradientColors[index]"
                  type="color"
                  @input="applyGradient"
                />
                <input
                  v-model="gradientColors[index]"
                  type="text"
                  @input="applyGradient"
                />
              </div>
            </label>
          </div>

          <div class="gradient-editor__preview" :style="{ background: draft.backgroundGradient || '#111' }" />

          <div class="gradient-editor__actions">
            <button type="button" @click="applyGradient">Apply gradient</button>
            <button type="button" @click="clearGradient">Clear gradient</button>
          </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Logo"
        panel-id="logo-editor-panel-body"
        :open="isLogoEditorOpen"
        body-class="text-style-panel__body logo-row"
        @toggle="togglePanel('logoEditor')"
      >
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
          <label>
            Logo Size
            <TextSizeSelector
              :model-value="draft.logoSize ?? DEFAULT_TEXT_SIZE"
              @update:model-value="(value) => { draft.logoSize = value; save() }"
            />
          </label>
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
      </CollapsibleSection>

      <label>
        Panel Image
        <p v-if="!canUploadImages" class="upgrade-hint">Login with Google to upload persistent images.</p>
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
            :disabled="!canUploadImages"
            @change="onFileChange"
          />
          <div class="image-dropzone__content">
            <p>{{ draft.image ? DROP_IMAGE_LOADED_TEXT : DROP_IMAGE_EMPTY_TEXT }}</p>
            <div class="image-dropzone__actions">
              <button type="button" :disabled="!canUploadImages" @click="openFilePicker">Choose Image</button>
              <button type="button" :disabled="!canUploadImages" @click="setRandomImage">Random Image</button>
              <button v-if="draft.image" type="button" :disabled="!canUploadImages" @click="clearImage">Remove</button>
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
import { ContentWidthMode, TextSize, type Panel } from '../../../types/navigation'
import TextSizeSelector from '../atoms/TextSizeSelector.vue'
import MarkdownField from '../atoms/MarkdownField.vue'
import CollapsibleSection from '../atoms/CollapsibleSection.vue'
import { useGradientEditor } from '../../composables/useGradientEditor'
import {
  DEFAULT_LOGO_TINT_COLOR,
  DEFAULT_SLIDE_COLOR,
  contentAlignOptions,
  DROP_IMAGE_EMPTY_TEXT,
  DROP_IMAGE_LOADED_TEXT,
  DROP_LOGO_EMPTY_TEXT,
  DROP_LOGO_LOADED_TEXT,
  textStyleRanges,
  useSlidePropertiesForm
} from '../../composables/useSlidePropertiesForm'

const props = withDefaults(
  defineProps<{
    open: boolean
    panel: Panel | null
    side?: 'left' | 'right'
    canUploadImages?: boolean
  }>(),
  {
    side: 'left',
    canUploadImages: true
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
const isTextContentOpen = ref(false)
const isTextStyleOpen = ref(false)
const isGradientEditorOpen = ref(false)
const isLogoEditorOpen = ref(false)
const {
  gradientType,
  gradientOrientation,
  gradientColors,
  orientationOptions,
  buildGradient,
  syncFromGradient
} = useGradientEditor(draft.backgroundGradient)

type PanelKey = 'textContent' | 'textStyle' | 'gradientEditor' | 'logoEditor'
const togglePanel = (key: PanelKey) => {
  if (key === 'textContent') isTextContentOpen.value = !isTextContentOpen.value
  if (key === 'textStyle') isTextStyleOpen.value = !isTextStyleOpen.value
  if (key === 'gradientEditor') isGradientEditorOpen.value = !isGradientEditorOpen.value
  if (key === 'logoEditor') isLogoEditorOpen.value = !isLogoEditorOpen.value
}

const applyGradient = () => {
  draft.backgroundGradient = buildGradient()
  save()
}

const clearGradient = () => {
  draft.backgroundGradient = undefined
  save()
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
    syncFromGradient(draft.backgroundGradient)
  }
)

watch(
  () => props.panel?.id,
  (nextId, prevId) => {
    if (!props.open || !nextId || nextId === prevId || !props.panel) return
    originalPanelSnapshot.value = { ...props.panel }
    syncFromGradient(draft.backgroundGradient)
  }
)

void fileInputRef
void logoFileInputRef
</script>
