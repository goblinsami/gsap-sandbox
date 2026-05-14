import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { SlidePathStep } from './useSlidePath'
import type { SnapEaseOption } from '../constants/snapEase'

gsap.registerPlugin(ScrollTrigger)

const SNAP_DURATION = 0.86
const WHEEL_INTENT_THRESHOLD = 9
const TOUCH_INTENT_THRESHOLD = 18
const INPUT_COOLDOWN_MS = 220

interface UseSlideSnapNavigationOptions {
  flowSteps: Ref<SlidePathStep[]>
  autoSnapEnabled: boolean
  loopEnabled: boolean
  snapEase: Ref<SnapEaseOption>
  enabled: boolean
  logPrefix?: string
}

export function useSlideSnapNavigation(options: UseSlideSnapNavigationOptions) {
  const logPrefix = options.logPrefix ?? '[flow-snap]'
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
  const normalizeIndex = (value: number, total: number) => {
    if (total <= 0) return 0
    if (!options.loopEnabled) return clampIndex(value, total)
    return ((value % total) + total) % total
  }

  const isIgnoredTarget = (target: EventTarget | null) => {
    const element = target instanceof Element ? target : null
    if (!element) return false
    return Boolean(
      element.closest(
        '.flow-creator, .flow-modal, .flow-canvas, .block-settings, input, textarea, select, button, [contenteditable="true"]'
      )
    )
  }

  const getStagePoint = (step: SlidePathStep) => ({
    x: -step.x * window.innerWidth,
    y: -step.y * window.innerHeight
  })

  const stepStyle = (step: SlidePathStep) => ({
    transform: `translate3d(${step.x * 100}vw, ${step.y * 100}vh, 0)`
  })

  const jumpToStep = (index: number) => {
    const stage = snapStageRef.value
    const total = options.flowSteps.value.length
    if (!stage || !total) return

    const nextIndex = normalizeIndex(index, total)
    const target = getStagePoint(options.flowSteps.value[nextIndex])
    gsap.set(stage, { x: target.x, y: target.y })
    activeStepIndex.value = nextIndex

    console.log(`${logPrefix} jump`, {
      index: nextIndex,
      x: target.x,
      y: target.y
    })
  }

  const goToStep = (index: number, source: string) => {
    const stage = snapStageRef.value
    const steps = options.flowSteps.value
    if (!stage || !steps.length) return
    if (isTransitioning.value) {
      console.log(`${logPrefix} skip (transitioning)`, { source, activeStepIndex: activeStepIndex.value, next: index })
      return
    }

    const normalizedIndex = normalizeIndex(index, steps.length)
    const wrapped = normalizedIndex !== index
    if (wrapped) {
      console.log(`${logPrefix} wrap`, {
        requested: index,
        normalized: normalizedIndex,
        total: steps.length
      })
    }

    if (normalizedIndex === activeStepIndex.value) {
      console.log(`${logPrefix} skip (same step)`, { source, step: normalizedIndex })
      return
    }

    const from = steps[activeStepIndex.value]
    const to = steps[normalizedIndex]
    const target = getStagePoint(to)

    isTransitioning.value = true
    console.log(`${logPrefix} transition:start`, {
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
      ease: options.snapEase.value,
      overwrite: 'auto',
      onComplete: () => {
        activeStepIndex.value = normalizedIndex
        isTransitioning.value = false
        console.log(`${logPrefix} transition:end`, {
          step: normalizedIndex,
          panelId: to.panel.id
        })
      },
      onInterrupt: () => {
        isTransitioning.value = false
        console.log(`${logPrefix} transition:interrupt`)
      }
    })
  }

  const shouldAcceptInput = () => {
    const now = Date.now()
    if (now - lastInputAt < INPUT_COOLDOWN_MS) {
      console.log(`${logPrefix} input:cooldown`, { elapsed: now - lastInputAt })
      return false
    }
    lastInputAt = now
    return true
  }

  const setupAutoSnapInteractions = () => {
    if (!options.autoSnapEnabled) return

    const wheelHandler = (event: WheelEvent) => {
      if (isIgnoredTarget(event.target)) return
      if (Math.abs(event.deltaY) < WHEEL_INTENT_THRESHOLD) return
      event.preventDefault()
      console.log(`${logPrefix} wheel`, {
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
      console.log(`${logPrefix} touchstart`, { touchStartY })
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
      console.log(`${logPrefix} touchmove`, {
        deltaY,
        activeStepIndex: activeStepIndex.value
      })

      if (!shouldAcceptInput()) return
      goToStep(activeStepIndex.value + (deltaY > 0 ? 1 : -1), 'touch')
    }

    const touchEndHandler = () => {
      touchStartY = null
      touchCommitted = false
      console.log(`${logPrefix} touchend`)
    }

    const keydownHandler = (event: KeyboardEvent) => {
      if (isIgnoredTarget(event.target)) return

      const key = event.key
      const forward = key === 'ArrowDown' || key === 'ArrowRight' || key === 'PageDown' || key === ' '
      const backward = key === 'ArrowUp' || key === 'ArrowLeft' || key === 'PageUp'
      if (!forward && !backward) return

      event.preventDefault()
      console.log(`${logPrefix} keydown`, {
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

    if (!options.enabled || !options.flowSteps.value.length) return

    console.log(`${logPrefix} init`, {
      autoSnapEnabled: options.autoSnapEnabled,
      loopEnabled: options.loopEnabled,
      snapEase: options.snapEase.value,
      totalSteps: options.flowSteps.value.length,
      steps: options.flowSteps.value.map((step) => ({
        index: step.index,
        panelId: step.panel.id,
        x: step.x,
        y: step.y,
        directionToNext: step.directionToNext
      }))
    })

    const total = options.flowSteps.value.length
    activeStepIndex.value = normalizeIndex(activeStepIndex.value, total)
    jumpToStep(activeStepIndex.value)

    if (options.autoSnapEnabled) {
      document.body.classList.add('snap-mode')
      setupAutoSnapInteractions()
      return
    }

    const stage = snapStageRef.value
    const shell = snapShellRef.value
    if (!stage || !shell) return

    const timeline = gsap.timeline({ defaults: { ease: 'none' } })
    timeline.addLabel('step-1', 0)

    for (let i = 1; i < options.flowSteps.value.length; i += 1) {
      const target = getStagePoint(options.flowSteps.value[i])
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

    const segments = Math.max(1, options.flowSteps.value.length - 1)
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
        ease: options.snapEase.value
      }
    })
  }

  const handleResize = () => {
    if (resizeDebounce !== null) window.clearTimeout(resizeDebounce)
    resizeDebounce = window.setTimeout(() => {
      void initNavigation()
      resizeDebounce = null
    }, 120)
  }

  onMounted(() => {
    if (!options.enabled) return
    void initNavigation()
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
    () => options.flowSteps.value,
    async () => {
      await initNavigation()
    },
    { deep: true }
  )

  watch(
    () => options.snapEase.value,
    async (nextEase, prevEase) => {
      if (!options.enabled || nextEase === prevEase) return
      console.log(`${logPrefix} ease:update`, { snapEase: nextEase })
      if (!options.autoSnapEnabled) await initNavigation()
    }
  )

  return {
    snapShellRef,
    snapStageRef,
    stepStyle
  }
}
