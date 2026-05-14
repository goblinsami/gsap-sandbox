<template>
  <section class="panel panel--hero" :class="panelClass" :data-animate="animateKey">
    <img v-if="image" class="panel__image" :src="image" alt="" />
    <div v-if="image" class="panel__overlay" />
    <article class="content" :class="{ 'content--on-image': !!image }">
      <p class="eyebrow" :class="`eyebrow--${eyebrowSize ?? 'm'}`">
        <span v-if="useMarkdown" v-html="eyebrowHtml" />
        <template v-else>{{ eyebrow }}</template>
        <span v-if="showDirectionIcon">{{ getDirectionIcon(direction) }}</span>
      </p>
      <h1 :class="`title--${titleSize ?? 'm'}`">
        <span v-if="useMarkdown" v-html="titleHtml" />
        <template v-else>{{ title }}</template>
      </h1>
      <p v-if="description" class="section-description" :class="`section-description--${descriptionSize ?? 'm'}`">
        <span v-if="useMarkdown" v-html="descriptionHtml" />
        <template v-else>{{ description }}</template>
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { Direction } from '../types/navigation'
import { getDirectionIcon } from '../composables/useDirectionIcon'

const props = defineProps<{
  title: string
  eyebrow?: string
  description?: string
  useMarkdown?: boolean
  titleSize?: 's' | 'm' | 'l'
  eyebrowSize?: 's' | 'm' | 'l'
  descriptionSize?: 's' | 'm' | 'l'
  panelClass?: string
  image?: string
  animateKey?: string
  direction: Direction
  showDirectionIcon?: boolean
}>()

const renderMarkdown = (value?: string) =>
  DOMPurify.sanitize(marked.parse(value ?? '', { breaks: true }) as string)

const titleHtml = computed(() => renderMarkdown(props.title))
const eyebrowHtml = computed(() => renderMarkdown(props.eyebrow))
const descriptionHtml = computed(() => renderMarkdown(props.description))
</script>
