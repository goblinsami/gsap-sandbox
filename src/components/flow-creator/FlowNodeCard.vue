<template>
  <article class="flow-block" :title="panel.id" :style="panelToneStyle">
    <strong class="flow-block__index">{{ index + 1 }}</strong>
    <div class="flow-block__direction">
      {{ directionIcon }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Panel } from '../../types/navigation'
import { getDirectionIcon } from '../../composables/useDirectionIcon'

const props = defineProps<{
  panel: Panel
  index: number
}>()

const directionIcon = computed(() => getDirectionIcon(props.panel.nextPanelPosition))

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

const panelToneStyle = computed(() => {
  const tone = PANEL_TONES[props.panel.panelClass] ?? 'rgba(255, 255, 255, 1)'
  return { backgroundColor: tone }
})
</script>
