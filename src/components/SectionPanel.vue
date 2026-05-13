<template>
  <section class="panel panel--hero" :class="panelClass" :data-animate="animateKey">
    <article class="content">
      <p class="eyebrow">{{ eyebrow }} {{ positionIcon(direction) }} {{ direction }}</p>
      <h1>{{ title }}</h1>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Direction } from '../types/navigation'

const positionIcon = (direction: Direction) => {
  switch (direction) {
    case 'up':
      return '🔼'
    case 'down':
      return '🔽'
    case 'left':
      return '⬅️'
    case 'right':
      return '➡️'
    default:
      return ''
  }
}

defineProps<{
  title: string
  eyebrow?: string
  panelClass?: string
  animateKey?: string
  direction: Direction
}>()
</script>
