<template>
  <section class="panel panel--hero" :class="panelClass" :data-animate="animateKey">
    <article class="content">
      <p class="eyebrow">{{ eyebrow }} <span v-if="showDirectionIcon">{{ getDirectionArrow(direction) }}</span></p>
      <h1>{{ title }}</h1>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Direction } from '../types/navigation'
import { getDirectionArrow } from '../composables/useDirectionArrow'




defineProps<{
  title: string
  eyebrow?: string
  panelClass?: string
  animateKey?: string
  direction: Direction,
  showDirectionIcon?: boolean
}>()
</script>
