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
import type { TextSize } from '../../types/navigation'

defineProps<{
  modelValue: TextSize
}>()

defineEmits<{
  'update:modelValue': [value: TextSize]
}>()

const sizes: TextSize[] = ['s', 'm', 'l']
</script>
