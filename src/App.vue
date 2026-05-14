<template>
  <main class="sandbox">
    <FlowCreator :panels="panelsState" @update:panels="handlePanelsUpdate" />

    <section ref="snapShellRef" class="snap-shell" :class="{ 'snap-shell--auto': autoSnapEnabled }">
      <div ref="snapStageRef" class="snap-stage">
        <div
          v-for="step in flowSteps"
          :key="step.panel.id"
          class="snap-step"
          :style="stepStyle(step)"
          :data-step-index="step.index"
        >
          <SectionPanel
            :title="step.panel.title"
            :eyebrow="step.panel.eyebrow"
            :description="step.panel.description"
            :use-markdown="step.panel.useMarkdown"
            :title-size="step.panel.titleSize"
            :eyebrow-size="step.panel.eyebrowSize"
            :description-size="step.panel.descriptionSize"
            :panel-class="step.panel.panelClass"
            :image="step.panel.image"
            :direction="step.directionToNext"
            animate-key="intro"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionPanel from './components/SectionPanel.vue'
import FlowCreator from './components/flow-creator/FlowCreator.vue'
import content from './data/content.json'
import type { ContentSchema, Direction, Panel } from './types/navigation'
import { validateContentSchema } from './utils/validateContent'
import { type FlowStep, useFlowSteps } from './composables/useFlowSteps'

gsap.registerPlugin(ScrollTrigger)

const LOG_PREFIX = '[flow-snap]'
const DEFAULT_DIRECTION: Direction = 'down'
const SNAP_DURATION = 0.84
const SNAP_EASE = 'power3.inOut'
const WHEEL_INTENT_THRESHOLD = 9
const TOUCH_INTENT_THRESHOLD = 18
const INPUT_COOLDOWN_MS = 220

const validation = validateContentSchema(content)
const isValid = validation.ok
const schema = content as ContentSchema
const autoSnapEnabled = schema.autoSnapEnabled ?? true

const panelsState = ref<Panel[]>(isValid ? ((schema.panels ?? []).map((p) => ({ ...p })) as Panel[]) : [])
const { flowSteps } = useFlowSteps(panelsState)

const snapShellRef = ref<HTMLElement | null>(null)
const snapStageRef = ref<HTMLElement | null>(null)
const activeStepIndex = ref(0)
const isTransitioning = ref(false)

let disposeInteractionHandlers: (() => void) | null = null
let disposeResizeHandler: (() => void) | null = null
let touchStartY: number | null = null
let touchCommitted = false
let lastInputAt = 0
let resizeDebounce: number | null = null

const clampIndex = (value: number, total: number) => Math.max(0, Math.min(total - 1, value))

const isIgnoredTarget = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null
  if (!element) return false
  return Boolean(
    element.closest(
      '.flow-creator, .flow-modal, .flow-canvas, .block-settings, input, textarea, select, button, [contenteditable="true"]'
    )
  )
}

const getStagePoint = (step: FlowStep) => ({
  x: -step.x * window.innerWidth,
  y: -step.y * window.innerHeight
})

const stepStyle = (step: FlowStep) => ({
  transform: `translate3d(${step.x * 100}vw, ${step.y * 100}vh, 0)`
})

const jumpToStep = (index: number) => {
  const stage = snapStageRef.value
  const total = flowSteps.value.length
  if (!stage || !total) return

  const nextIndex = clampIndex(index, total)
  const target = getStagePoint(flowSteps.value[nextIndex])
  gsap.set(stage, { x: target.x, y: target.y })
  activeStepIndex.value = nextIndex

  console.log(`${LOG_PREFIX} jump`, {
    index: nextIndex,
    x: target.x,
    y: target.y
  })
}

const goToStep = (index: number, source: string) => {
  const stage = snapStageRef.value
  const steps = flowSteps.value
  if (!stage || !steps.length) return
  if (isTransitioning.value) {
    console.log(`${LOG_PREFIX} skip (transitioning)`, { source, activeStepIndex: activeStepIndex.value, next: index })
    return
  }

  const nextIndex = clampIndex(index, steps.length)
  if (nextIndex === activeStepIndex.value) {
    console.log(`${LOG_PREFIX} skip (same step)`, { source, step: nextIndex })
    return
  }

  const from = steps[activeStepIndex.value]
  const to = steps[nextIndex]
  const target = getStagePoint(to)

  isTransitioning.value = true
  console.log(`${LOG_PREFIX} transition:start`, {
    source,
    from: {
      index: from.index,
      panelId: from.panel.id,
      x: from.x,
      y: from.y
    },
    to: {
      index: to.index,
      panelId: to.panel.id,
      x: to.x,
      y: to.y
    },
    target
  })

  gsap.to(stage, {
    x: target.x,
    y: target.y,
    duration: SNAP_DURATION,
    ease: SNAP_EASE,
    overwrite: 'auto',
    onComplete: () => {
      activeStepIndex.value = nextIndex
      isTransitioning.value = false
      console.log(`${LOG_PREFIX} transition:end`, {
        step: nextIndex,
        panelId: to.panel.id
      })
    },
    onInterrupt: () => {
      isTransitioning.value = false
      console.log(`${LOG_PREFIX} transition:interrupt`)
    }
  })
}

const shouldAcceptInput = () => {
  const now = Date.now()
  if (now - lastInputAt < INPUT_COOLDOWN_MS) {
    console.log(`${LOG_PREFIX} input:cooldown`, { elapsed: now - lastInputAt })
    return false
  }
  lastInputAt = now
  return true
}

const setupAutoSnapInteractions = () => {
  if (!autoSnapEnabled) return

  const wheelHandler = (event: WheelEvent) => {
    if (isIgnoredTarget(event.target)) return
    if (Math.abs(event.deltaY) < WHEEL_INTENT_THRESHOLD) return
    event.preventDefault()
    console.log(`${LOG_PREFIX} wheel`, {
      deltaY: event.deltaY,
      activeStepIndex: activeStepIndex.value
    })

    if (!shouldAcceptInput()) return
    goToStep(activeStepIndex.value + (event.deltaY > 0 ? 1 : -1), 'wheel')
  }

  const touchStartHandler = (event: TouchEvent) => {
    if (isIgnoredTarget(event.target)) return
    touchStartY = event.changedTouches[0]?.clientY ?? null
    touchCommitted = false
    console.log(`${LOG_PREFIX} touchstart`, { touchStartY })
  }

  const touchMoveHandler = (event: TouchEvent) => {
    if (isIgnoredTarget(event.target)) return
    if (touchStartY === null || touchCommitted) return

    const currentY = event.changedTouches[0]?.clientY
    if (typeof currentY !== 'number') return
    const deltaY = touchStartY - currentY
    if (Math.abs(deltaY) < TOUCH_INTENT_THRESHOLD) return

    event.preventDefault()
    touchCommitted = true
    console.log(`${LOG_PREFIX} touchmove`, {
      deltaY,
      activeStepIndex: activeStepIndex.value
    })

    if (!shouldAcceptInput()) return
    goToStep(activeStepIndex.value + (deltaY > 0 ? 1 : -1), 'touch')
  }

  const touchEndHandler = () => {
    touchStartY = null
    touchCommitted = false
    console.log(`${LOG_PREFIX} touchend`)
  }

  const keydownHandler = (event: KeyboardEvent) => {
    if (isIgnoredTarget(event.target)) return

    const key = event.key
    const forward = key === 'ArrowDown' || key === 'ArrowRight' || key === 'PageDown' || key === ' '
    const backward = key === 'ArrowUp' || key === 'ArrowLeft' || key === 'PageUp'
    if (!forward && !backward) return

    event.preventDefault()
    console.log(`${LOG_PREFIX} keydown`, {
      key,
      activeStepIndex: activeStepIndex.value
    })

    if (!shouldAcceptInput()) return
    goToStep(activeStepIndex.value + (forward ? 1 : -1), 'keyboard')
  }

  window.addEventListener('wheel', wheelHandler, { passive: false })
  window.addEventListener('touchstart', touchStartHandler, { passive: true })
  window.addEventListener('touchmove', touchMoveHandler, { passive: false })
  window.addEventListener('touchend', touchEndHandler, { passive: true })
  window.addEventListener('keydown', keydownHandler)

  disposeInteractionHandlers = () => {
    window.removeEventListener('wheel', wheelHandler)
    window.removeEventListener('touchstart', touchStartHandler)
    window.removeEventListener('touchmove', touchMoveHandler)
    window.removeEventListener('touchend', touchEndHandler)
    window.removeEventListener('keydown', keydownHandler)
  }
}

const destroyNavigation = () => {
  if (disposeInteractionHandlers) {
    disposeInteractionHandlers()
    disposeInteractionHandlers = null
  }
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  if (resizeDebounce !== null) {
    window.clearTimeout(resizeDebounce)
    resizeDebounce = null
  }
  document.body.classList.remove('snap-mode')
  touchStartY = null
  touchCommitted = false
  isTransitioning.value = false
}

const initNavigation = async () => {
  await nextTick()
  destroyNavigation()

  if (!flowSteps.value.length) return

  console.log(`${LOG_PREFIX} init`, {
    autoSnapEnabled,
    totalSteps: flowSteps.value.length,
    steps: flowSteps.value.map((step) => ({
      index: step.index,
      panelId: step.panel.id,
      x: step.x,
      y: step.y,
      directionToNext: step.directionToNext ?? DEFAULT_DIRECTION
    }))
  })

  const total = flowSteps.value.length
  activeStepIndex.value = clampIndex(activeStepIndex.value, total)
  jumpToStep(activeStepIndex.value)

  if (autoSnapEnabled) {
    document.body.classList.add('snap-mode')
    setupAutoSnapInteractions()
    return
  }

  const stage = snapStageRef.value
  const shell = snapShellRef.value
  if (!stage || !shell) return

  const timeline = gsap.timeline({ defaults: { ease: 'none' } })
  timeline.addLabel('step-1', 0)

  for (let i = 1; i < flowSteps.value.length; i += 1) {
    const target = getStagePoint(flowSteps.value[i])
    timeline.to(
      stage,
      {
        x: target.x,
        y: target.y,
        duration: 1
      },
      i - 1
    )
    timeline.addLabel(`step-${i + 1}`, i)
  }

  const segments = Math.max(1, flowSteps.value.length - 1)
  ScrollTrigger.create({
    animation: timeline,
    trigger: shell,
    start: 'top top',
    end: () => `+=${segments * window.innerHeight}`,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    snap: {
      snapTo: 'labelsDirectional',
      inertia: false,
      duration: { min: 0.2, max: 0.45 },
      delay: 0.06,
      ease: 'power2.out'
    }
  })
}

const handlePanelsUpdate = (updated: Panel[]) => {
  panelsState.value = updated.map((panel) => ({ ...panel }))
}

const handleResize = () => {
  if (resizeDebounce !== null) window.clearTimeout(resizeDebounce)
  resizeDebounce = window.setTimeout(() => {
    initNavigation()
    resizeDebounce = null
  }, 120)
}

onMounted(() => {
  console.log(`${LOG_PREFIX} mounted`)
  if (!isValid) {
    alert(`JSON inválido:\n\n${validation.errors.join('\n')}`)
    return
  }

  initNavigation()
  window.addEventListener('resize', handleResize)
  disposeResizeHandler = () => window.removeEventListener('resize', handleResize)
})

onUnmounted(() => {
  destroyNavigation()
  if (disposeResizeHandler) {
    disposeResizeHandler()
    disposeResizeHandler = null
  }
})

watch(
  () => panelsState.value,
  async () => {
    await initNavigation()
  },
  { deep: true }
)
</script>

