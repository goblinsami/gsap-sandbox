<template>
  <main class="sandbox">
    <FlowCreator :panels="panelsState" @update:panels="handlePanelsUpdate" />
    <template v-for="(block, index) in blocks" :key="makeBlockKey(block, index)">
      <div class="snap-slide" :data-snap-slide="index">
        <SectionPanel
          v-if="block.type === 'panel'"
          :title="block.panel.title"
          :eyebrow="block.panel.eyebrow"
          :description="block.panel.description"
          :use-markdown="block.panel.useMarkdown"
          :title-size="block.panel.titleSize"
          :eyebrow-size="block.panel.eyebrowSize"
          :description-size="block.panel.descriptionSize"
          :panel-class="block.panel.panelClass"
          :image="block.panel.image"
          animate-key="intro"
          :direction="block.direction"
        />

        <section v-else class="h-scroll" :data-direction="block.direction">
          <div class="h-track">
            <SectionPanel
              v-for="panel in (block.direction === DIRECTION_LEFT ? [...block.panels].reverse() : block.panels)"
              :key="panel.id"
              :title="panel.title"
              :eyebrow="panel.eyebrow"
              :description="panel.description"
              :use-markdown="panel.useMarkdown"
              :title-size="panel.titleSize"
              :eyebrow-size="panel.eyebrowSize"
              :description-size="panel.descriptionSize"
              :panel-class="`${panel.panelClass} h-panel`"
              :image="panel.image"
              :direction="panel.nextPanelPosition ?? block.direction"
            />
          </div>
        </section>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionPanel from './components/SectionPanel.vue'
import FlowCreator from './components/flow-creator/FlowCreator.vue'
import content from './data/content.json'
import type { ContentSchema, Panel } from './types/navigation'
import { validateContentSchema } from './utils/validateContent'
import { useFlowBlocks } from './composables/useFlowBlocks'

gsap.registerPlugin(ScrollTrigger)

const DIRECTION_LEFT = 'left' as const
const SCROLL_LOG_PREFIX = '[gsap-snap]'
const EPSILON = 0.0005

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
    const blockPanelsCount = track.querySelectorAll('.panel').length
    console.log(`${SCROLL_LOG_PREFIX} horizontal snap`, {
      direction,
      blockPanelsCount
    })

    if (direction === DIRECTION_LEFT) {
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
  const snapSlides = gsap.utils.toArray<HTMLElement>('.snap-slide')
  const maxScroll = Math.max(1, ScrollTrigger.maxScroll(window))
  type SnapSegment = {
    index: number
    kind: 'vertical' | 'horizontal'
    startY: number
    endY: number
    pointsY: number[]
    panelsCount: number
  }

  const segments: SnapSegment[] = snapSlides.map((slide, index) => {
    const horizontal = slide.querySelector<HTMLElement>('.h-scroll')
    const startY = slide.offsetTop
    const nextY = snapSlides[index + 1]?.offsetTop ?? maxScroll

    if (!horizontal) {
      return {
        index,
        kind: 'vertical',
        startY,
        endY: nextY,
        pointsY: [startY],
        panelsCount: 1
      }
    }

    const track = horizontal.querySelector<HTMLElement>('.h-track')
    const panelsCount = track?.querySelectorAll('.panel').length ?? 1
    const distance = Math.max(0, (track?.scrollWidth ?? window.innerWidth) - window.innerWidth)
    const stepDistance = panelsCount > 1 ? distance / (panelsCount - 1) : 0
    const pointsY = Array.from({ length: Math.max(1, panelsCount) }, (_v, i) => startY + stepDistance * i)

    return {
      index,
      kind: 'horizontal',
      startY,
      endY: startY + distance,
      pointsY,
      panelsCount
    }
  })

  const snapPointsY = segments
    .flatMap((segment) => segment.pointsY)
    .filter((y, i, arr) => arr.findIndex((v) => Math.abs(v - y) < 0.5) === i)
    .sort((a, b) => a - b)
  const snapPoints = snapPointsY.map((y) => y / maxScroll)

  if (snapPoints.length > 1) {
    const oneStepSnap = (value: number, self?: ScrollTrigger) => {
      const direction = self?.direction ?? 1
      const closestIndex = snapPoints.reduce((best, point, index) => {
        const bestDist = Math.abs(snapPoints[best] - value)
        const dist = Math.abs(point - value)
        return dist < bestDist ? index : best
      }, 0)

      const onPoint = Math.abs(value - snapPoints[closestIndex]) <= EPSILON
      const move = direction > 0 ? 1 : -1
      const baseIndex = onPoint ? closestIndex : closestIndex
      const nextIndex = Math.max(0, Math.min(snapPoints.length - 1, baseIndex + move))
      const target = snapPoints[nextIndex]

      console.log(`${SCROLL_LOG_PREFIX} snap step`, {
        value,
        direction,
        closestIndex,
        onPoint,
        nextIndex,
        target
      })
      return target
    }

    ScrollTrigger.create({
      trigger: '.sandbox',
      start: 0,
      end: 'max',
      snap: {
        snapTo: oneStepSnap,
        inertia: false,
        duration: { min: 0.12, max: 0.28 },
        delay: 0.04,
        ease: 'power1.out'
      }
    })
  }

  console.log(`${SCROLL_LOG_PREFIX} configured`, {
    segments: segments.map((segment) => ({
      index: segment.index,
      kind: segment.kind,
      panelsCount: segment.panelsCount,
      startY: segment.startY,
      endY: segment.endY,
      pointsY: segment.pointsY
    })),
    snapPointsY,
    totalSlides: snapSlides.length,
    snapPoints
  })
  window.scrollTo(0, previousScrollY)
  ScrollTrigger.refresh()
}

const handlePanelsUpdate = (updated: Panel[]) => {
  panelsState.value = updated.map((p) => ({ ...p }))
}

onMounted(() => {
  console.log(`${SCROLL_LOG_PREFIX} mounted`)
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
