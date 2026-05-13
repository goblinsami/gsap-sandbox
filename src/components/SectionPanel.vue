<template>
  <section class="panel panel--hero" :class="panelClass" :data-animate="animateKey">
    <img v-if="image" class="panel__image" :src="image" alt="" />
    <div v-if="image" class="panel__overlay" />
    <article class="content" :class="{ 'content--on-image': !!image }">
      <p class="eyebrow" :class="`eyebrow--${eyebrowSize ?? 'm'}`">
        {{ eyebrow }}
        <span v-if="showDirectionIcon">{{ getDirectionArrow(direction) }}</span>
      </p>
      <h1 :class="`title--${titleSize ?? 'm'}`">{{ title }}</h1>
      <p v-if="description" class="section-description" :class="`section-description--${descriptionSize ?? 'm'}`">{{ description }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { Direction } from '../types/navigation'
import { getDirectionArrow } from '../composables/useDirectionArrow'

defineProps<{
  title: string
  eyebrow?: string
  description?: string
  titleSize?: 's' | 'm' | 'l'
  eyebrowSize?: 's' | 'm' | 'l'
  descriptionSize?: 's' | 'm' | 'l'
  panelClass?: string
  image?: string
  animateKey?: string
  direction: Direction
  showDirectionIcon?: boolean
}>()
</script>
