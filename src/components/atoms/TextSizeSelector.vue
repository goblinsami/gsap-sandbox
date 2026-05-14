<template>
  <div class="text-size-picker">
    <button
      v-for="size in sizes"
      :key="size"
      type="button"
      class="text-size-picker__btn"
      :class="{ active: modelValue === size }"
      @click="$emit('update:modelValue', size)"
    >
      {{ size.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { TextSizeValues, type TextSize as PanelTextSize } from '../../types/navigation'

defineProps<{
  modelValue: PanelTextSize
}>()

defineEmits<{
  'update:modelValue': [value: PanelTextSize]
}>()

const sizes: readonly PanelTextSize[] = [...TextSizeValues]
</script>
