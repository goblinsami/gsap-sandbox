<template>
  <article class="flow-block" :title="block.id" :style="blockToneStyle">
    <strong class="flow-block__index">{{ index + 1 }}</strong>
    <div class="flow-block__direction">
      {{ directionArrow }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Panel } from '../../types/navigation'
import { getDirectionArrow } from '../../composables/useDirectionArrow'

const props = defineProps<{
  block: Panel
  index: number
}>()

const directionArrow = computed(() => getDirectionArrow(props.block.nextPanelPosition))

const PANEL_TONES: Record<string, string> = {
  contrast: 'rgba(51, 51, 51, 0.12)',
  outro: 'rgba(232, 241, 255, 0.8)',
  red: 'rgba(255, 77, 77, 0.14)',
  danger: 'rgba(180, 35, 24, 0.14)',
  ocean: 'rgba(14, 116, 144, 0.14)',
  forest: 'rgba(22, 101, 52, 0.14)',
  violet: 'rgba(109, 40, 217, 0.14)',
  amber: 'rgba(245, 158, 11, 0.16)'
}

const blockToneStyle = computed(() => {
  const tone = PANEL_TONES[props.block.panelClass] ?? 'rgba(255, 255, 255, 1)'
  return { backgroundColor: tone }
})
</script>
