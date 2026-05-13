<template>
  <main class="sandbox">
    <template v-for="(block, index) in blocks" :key="`block-${index}`">
      <SectionPanel
        v-if="block.type === 'panel'"
        :title="block.panel.title"
        :eyebrow="block.panel.eyebrow"
        :panel-class="block.panel.panelClass"
        animate-key="intro"
        :direction="block.direction"
      />

      <section
        v-else
        class="h-scroll"
        :data-direction="block.direction"
      >
        <div class="h-track">
          <SectionPanel
            v-for="panel in block.panels"
            :key="panel.id"
            :title="panel.title"
            :eyebrow="panel.eyebrow"
            :panel-class="`${panel.panelClass} h-panel`"
            :direction="panel.nextPanelPosition ?? block.direction"
          />
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionPanel from './components/SectionPanel.vue'
import content from './data/content.json'
import type { ContentSchema, Direction, HorizontalBlock, RenderBlock } from './types/navigation'

gsap.registerPlugin(ScrollTrigger)

const panels = ((content as ContentSchema).panels ?? [])

const blocks = computed<RenderBlock[]>(() => {
  if (!panels.length) return []

  const result: RenderBlock[] = []
  let i = 0

  while (i < panels.length) {
    const current = panels[i]
    const currentDirection = (current.nextPanelPosition ?? 'down') as Direction

    if (currentDirection === 'left' || currentDirection === 'right') {
      const direction = currentDirection
      const horizontalPanels = [current]
      let j = i + 1

      while (j < panels.length) {
        horizontalPanels.push(panels[j])
        const nextDir = (panels[j].nextPanelPosition ?? 'down') as Direction
        if (nextDir !== direction) break
        j += 1
      }

      const horizontalBlock: HorizontalBlock = {
        type: 'horizontal',
        panels: horizontalPanels,
        direction
      }

      result.push(horizontalBlock)
      i += horizontalPanels.length
      continue
    }

    result.push({ type: 'panel', panel: current, direction: currentDirection })
    i += 1
  }

  return result
})

const initAnimations = async () => {
  await nextTick()
  ScrollTrigger.getAll().forEach((t) => t.kill())

  gsap.utils.toArray<HTMLElement>('[data-animate="intro"]').forEach((section) => {
    gsap.fromTo(
      section,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%'
        }
      }
    )
  })

  gsap.utils.toArray<HTMLElement>('.h-scroll').forEach((container) => {
    const track = container.querySelector<HTMLElement>('.h-track')
    if (!track) return

    const distance = track.scrollWidth - window.innerWidth
    if (distance <= 0) return

    gsap.to(track, {
      x: -distance,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: () => `+=${distance}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1
      }
    })
  })
}

onMounted(() => {
  initAnimations()
})
</script>
