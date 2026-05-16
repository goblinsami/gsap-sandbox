<template>
  <div class="text-size-picker">
    <button
      v-for="size in sizes"
      :key="size"
      type="button"
      class="text-size-picker__btn ui-btn"
      :class="{ active: selectedSize === size, 'text-size-picker__btn--active': selectedSize === size }"
      :aria-pressed="selectedSize === size"
      @click="$emit('update:modelValue', size)"
    >
      {{ size.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TextSizeValues, type TextSize as PanelTextSize } from '../../../types/navigation'
import { normalizeTextSize } from '../../../utils/textSize'
import { DEFAULT_TEXT_SIZE } from '../../../constants/slideStyle'

const props = defineProps<{
  modelValue: PanelTextSize
}>()

defineEmits<{
  'update:modelValue': [value: PanelTextSize]
}>()

const sizes: readonly PanelTextSize[] = [...TextSizeValues]
const selectedSize = computed<PanelTextSize>(() => normalizeTextSize(props.modelValue, DEFAULT_TEXT_SIZE))
</script>
