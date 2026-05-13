import { computed, nextTick, ref, watch, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import type { Direction, Panel } from '../types/navigation'
import { validateContentSchema } from '../utils/validateContent'

gsap.registerPlugin(ScrollToPlugin)

const STEP = 92
const BLOCK_WIDTH = 96
const BLOCK_HEIGHT = 88
const CANVAS_PADDING = 24
const CANVAS_MAX_WIDTH = '100%'
const CANVAS_MAX_HEIGHT = '100%'
const MODAL_MAX_WIDTH = '80vw'
const MODAL_MAX_HEIGHT = '80vh'
const MODAL_MIN_WIDTH = '360px'
const MODAL_MIN_HEIGHT = '260px'
const PANEL_CLASS_POOL = ['contrast', 'outro', 'red', 'danger', 'ocean', 'forest', 'violet', 'amber'] as const

export function useFlowCreator(
  panelsRef: Ref<Panel[]>,
  emitUpdatePanels: (panels: Panel[]) => void
) {
  const showModal = ref(false)
  const localPanels = ref<Panel[]>([])
  const canvasRef = ref<HTMLElement | null>(null)
  const showSettings = ref(false)
  const selectedIndex = ref<number | null>(null)
  const pendingScrollToLast = ref(false)
  const pendingScrollToPanelId = ref<string | null>(null)

  watch(
    () => panelsRef.value,
    (value) => {
      localPanels.value = value.map((p) => ({ ...p, nextPanelPosition: p.nextPanelPosition ?? 'down' }))
    },
    { immediate: true, deep: true }
  )

  const toggleModal = () => {
    showModal.value = !showModal.value
  }

  const moveByDirection = (x: number, y: number, direction: Direction) => {
    switch (direction) {
      case 'up':
        return { x, y: y - 1 }
      case 'down':
        return { x, y: y + 1 }
      case 'left':
        return { x: x - 1, y }
      case 'right':
        return { x: x + 1, y }
      default:
        return { x, y: y + 1 }
    }
  }

  const getRandomPanelClass = (previousClass?: string): string => {
    const options = PANEL_CLASS_POOL.filter((c) => c !== previousClass)
    const pool = options.length ? options : PANEL_CLASS_POOL
    const idx = Math.floor(Math.random() * pool.length)
    return pool[idx]
  }

  const positionedPanels = computed(() => {
    const placed: { panel: Panel; index: number; x: number; y: number }[] = []
    let x = 0
    let y = 0

    localPanels.value.forEach((panel, index) => {
      placed.push({ panel, index, x, y })
      const direction = (panel.nextPanelPosition ?? 'down') as Direction
      const nextPos = moveByDirection(x, y, direction)
      x = nextPos.x
      y = nextPos.y
    })

    return placed
  })

  watch(
    () => positionedPanels.value.length,
    async () => {
      if (!pendingScrollToLast.value && !pendingScrollToPanelId.value) return
      await nextTick()
      await nextTick()
      setTimeout(() => {
        forceScrollToBottom()
        pendingScrollToPanelId.value = null
        pendingScrollToLast.value = false
      }, 80)
    }
  )

  const bounds = computed(() => {
    if (!positionedPanels.value.length) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    }

    const xs = positionedPanels.value.map((n) => n.x)
    const ys = positionedPanels.value.map((n) => n.y)
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    }
  })

  const canvasStyle = computed(() => ({
    width: '100%',
    height: '100%',
    maxWidth: CANVAS_MAX_WIDTH,
    maxHeight: CANVAS_MAX_HEIGHT
  }))

  const stageStyle = computed(() => {
    const width = (bounds.value.maxX - bounds.value.minX) * STEP + BLOCK_WIDTH + CANVAS_PADDING * 2
    const height = (bounds.value.maxY - bounds.value.minY) * STEP + BLOCK_HEIGHT + CANVAS_PADDING * 2
    return {
      width: `${Math.max(width, BLOCK_WIDTH + CANVAS_PADDING * 2)}px`,
      height: `${Math.max(height, BLOCK_HEIGHT + CANVAS_PADDING * 2)}px`
    }
  })

  const modalStyle = computed(() => ({
    maxWidth: MODAL_MAX_WIDTH,
    maxHeight: MODAL_MAX_HEIGHT,
    minWidth: MODAL_MIN_WIDTH,
    minHeight: MODAL_MIN_HEIGHT
  }))

  const nodeStyle = (x: number, y: number) => ({
    left: `${(x - bounds.value.minX) * STEP + CANVAS_PADDING}px`,
    top: `${(y - bounds.value.minY) * STEP + CANVAS_PADDING}px`
  })

  const forceScrollToBottom = () => {
    window.scrollTo(0, document.body.scrollHeight)
  }

  const flowLinks = computed(() => {
    if (positionedPanels.value.length <= 1) return []

    return positionedPanels.value.slice(0, -1).map((from, index) => {
      const to = positionedPanels.value[index + 1]
      const fromCenterX = (from.x - bounds.value.minX) * STEP + CANVAS_PADDING + BLOCK_WIDTH / 2
      const fromCenterY = (from.y - bounds.value.minY) * STEP + CANVAS_PADDING + BLOCK_HEIGHT / 2
      const toCenterX = (to.x - bounds.value.minX) * STEP + CANVAS_PADDING + BLOCK_WIDTH / 2
      const toCenterY = (to.y - bounds.value.minY) * STEP + CANVAS_PADDING + BLOCK_HEIGHT / 2

      const dx = toCenterX - fromCenterX
      const dy = toCenterY - fromCenterY
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      return {
        id: `${from.panel.id}-${to.panel.id}-${index}`,
        style: {
          left: `${fromCenterX}px`,
          top: `${fromCenterY}px`,
          width: `${length}px`,
          transform: `rotate(${angle}deg)`
        }
      }
    })
  })

  const opposite: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  }

  const normalizePanels = (list: Panel[]): Panel[] => {
    return list.map((p) => ({ ...p, nextPanelPosition: (p.nextPanelPosition ?? 'down') as Direction }))
  }

  const renumberPanels = (list: Panel[]): Panel[] => {
    return list.map((panel, index) => {
      const n = index + 1
      const title = panel.title.trim()
      let nextTitle = title

      if (/^New Panel \d+$/i.test(title)) {
        nextTitle = `New Panel ${n}`
      } else if (/^Section \d+(?::\s*)?/i.test(title)) {
        nextTitle = title.replace(/^Section \d+(?::\s*)?/i, `Section ${n}: `)
      }

      return {
        ...panel,
        id: `panel-${n}`,
        title: nextTitle
      }
    })
  }

  const allowedDirections = (index: number): Exclude<Direction, 'up'>[] => {
    const all: Exclude<Direction, 'up'>[] = ['down', 'left', 'right']
    if (index === 0) return all

    const prev = (localPanels.value[index - 1]?.nextPanelPosition ?? 'down') as Direction
    return all.filter((d) => d !== opposite[prev])
  }

  const canCommitPanels = (nextPanels: Panel[]) => {
    const sanitized = renumberPanels(normalizePanels(nextPanels))
    return validateContentSchema({ panels: sanitized }).ok
  }

  const insertableDirections = (index: number): Exclude<Direction, 'up'>[] => {
    return allowedDirections(index).filter((direction) => {
      const current = localPanels.value[index]
      if (!current) return false
      const previousNext = (current.nextPanelPosition ?? 'down') as Direction
      const nextPanels = localPanels.value.map((p) => ({ ...p }))
      nextPanels[index].nextPanelPosition = direction
      const candidate: Panel = {
        id: makeId(),
        eyebrow: 'GSAP Sandbox',
        title: `New Panel ${nextPanels.length + 1}`,
        panelClass: getRandomPanelClass(nextPanels[index].panelClass),
        nextPanelPosition: previousNext
      }
      nextPanels.splice(index + 1, 0, candidate)
      return canCommitPanels(nextPanels)
    })
  }

  const commitPanels = (nextPanels: Panel[], showAlert = true) => {
    const sanitized = renumberPanels(normalizePanels(nextPanels))
    const validation = validateContentSchema({ panels: sanitized })
    if (!validation.ok) {
      if (showAlert) {
        alert(`Estructura inválida:\n\n${validation.errors.join('\n')}`)
      }
      return false
    }

    localPanels.value = sanitized.map((p) => ({ ...p }))
    emitUpdatePanels(localPanels.value.map((p) => ({ ...p })))
    return true
  }

  const makeId = () => `panel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const insertAfter = (index: number, direction: Exclude<Direction, 'up'>) => {
    const current = localPanels.value[index]
    if (!current) return

    const previousNext = (current.nextPanelPosition ?? 'down') as Direction
    const nextPanels = localPanels.value.map((p) => ({ ...p }))
    nextPanels[index].nextPanelPosition = direction

    const newPanel: Panel = {
      id: makeId(),
      eyebrow: 'GSAP Sandbox',
      title: `New Panel ${nextPanels.length + 1}`,
      panelClass: getRandomPanelClass(nextPanels[index].panelClass),
      nextPanelPosition: previousNext
    }

    nextPanels.splice(index + 1, 0, newPanel)
    if (commitPanels(nextPanels, false)) {
      pendingScrollToLast.value = true
    }
  }

  const openSettings = (index: number) => {
    selectedIndex.value = index
    showSettings.value = true
  }

  const closeSettings = () => {
    showSettings.value = false
    selectedIndex.value = null
  }

  const selectedPanel = computed(() => {
    if (selectedIndex.value === null) return null
    return localPanels.value[selectedIndex.value] ?? null
  })

  const saveSettings = (updated: Panel) => {
    if (selectedIndex.value === null) return
    const nextPanels = localPanels.value.map((p) => ({ ...p }))
    nextPanels[selectedIndex.value] = { ...updated }
    if (commitPanels(nextPanels)) {
      closeSettings()
    }
  }

  const deletePanel = () => {
    if (selectedIndex.value === null) return
    if (localPanels.value.length <= 1) {
      alert('No puedes eliminar el único panel del flujo.')
      return
    }

    const nextPanels = localPanels.value.map((p) => ({ ...p }))
    nextPanels.splice(selectedIndex.value, 1)

    if (commitPanels(nextPanels)) {
      closeSettings()
    }
  }

  const deletePanelAt = (index: number) => {
    if (localPanels.value.length <= 1) {
      alert('No puedes eliminar el único panel del flujo.')
      return
    }

    const nextPanels = localPanels.value.map((p) => ({ ...p }))
    nextPanels.splice(index, 1)
    commitPanels(nextPanels)
  }

  return {
    showModal,
    canvasRef,
    showSettings,
    positionedPanels,
    canvasStyle,
    stageStyle,
    modalStyle,
    flowLinks,
    selectedPanel,
    toggleModal,
    nodeStyle,
    forceScrollToBottom,
    openSettings,
    closeSettings,
    saveSettings,
    deletePanel,
    deletePanelAt,
    insertableDirections,
    insertAfter
  }
}

