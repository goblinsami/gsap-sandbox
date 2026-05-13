<template>
  <main class="sandbox">
    <FlowCreator :panels="panelsState" @update:panels="handlePanelsUpdate" />
    <template v-for="(block, index) in blocks" :key="makeBlockKey(block, index)">
      <SectionPanel
        v-if="block.type === 'panel'"
        :title="block.panel.title"
        :eyebrow="block.panel.eyebrow"
        :panel-class="block.panel.panelClass"
        :image="block.panel.image"
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
            v-for="panel in (block.direction === 'left' ? [...block.panels].reverse() : block.panels)"
            :key="panel.id"
            :title="panel.title"
            :eyebrow="panel.eyebrow"
            :panel-class="`${panel.panelClass} h-panel`"
            :image="panel.image"
            :direction="panel.nextPanelPosition ?? block.direction"
          />
        </div>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionPanel from './components/SectionPanel.vue'
import FlowCreator from './components/FlowCreator.vue'
import content from './data/content.json'
import type { ContentSchema, Panel } from './types/navigation'
import { validateContentSchema } from './utils/validateContent'
import { useFlowBlocks } from './composables/useFlowBlocks'

gsap.registerPlugin(ScrollTrigger)

const validation = validateContentSchema(content)
const isValid = validation.ok
const panelsState = ref<Panel[]>(isValid ? ((content as ContentSchema).panels ?? []).map((p) => ({ ...p })) : [])
const { blocks, makeBlockKey } = useFlowBlocks(panelsState)

const initAnimations = async () => {
  const previousScrollY = window.scrollY
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

    const direction = container.dataset.direction

    if (direction === 'left') {
      gsap.set(track, { x: -distance })
      gsap.to(track, {
        x: 0,
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
      return
    }

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

  await nextTick()
  window.scrollTo(0, previousScrollY)
  ScrollTrigger.refresh()
}

const handlePanelsUpdate = (updated: Panel[]) => {
  panelsState.value = updated.map((p) => ({ ...p }))
}


onMounted(() => {
  if (!isValid) {
    alert(`JSON inválido:\n\n${validation.errors.join('\n')}`)
    return
  }
  initAnimations()
})

watch(
  () => panelsState.value,
  async () => {
    await initAnimations()
  },
  { deep: true }
)
</script>
