import { computed, ref } from 'vue'
import {
  CONIC_ORIENTATIONS,
  DEFAULT_GRADIENT_COLORS,
  DEFAULT_GRADIENT_TYPE,
  LINEAR_ORIENTATIONS,
  RADIAL_ORIENTATIONS,
  type GradientType
} from '../../constants/gradientEditor'

const normalizeHex = (value: string, fallback: string) => {
  const raw = value.trim()
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback
}

export function useGradientEditor(initialGradient?: string) {
  const gradientType = ref<GradientType>(DEFAULT_GRADIENT_TYPE)
  const gradientOrientation = ref('135deg')
  const gradientColors = ref<string[]>([...DEFAULT_GRADIENT_COLORS])

  const orientationOptions = computed(() => {
    if (gradientType.value === 'radial') return RADIAL_ORIENTATIONS
    if (gradientType.value === 'conic') return CONIC_ORIENTATIONS
    return LINEAR_ORIENTATIONS
  })

  const buildGradient = () => {
    const colors = gradientColors.value.map((color, index) => normalizeHex(color, DEFAULT_GRADIENT_COLORS[index]))
    gradientColors.value = colors
    const stops = `${colors[0]} 0%, ${colors[1]} 33%, ${colors[2]} 66%, ${colors[3]} 100%`
    if (gradientType.value === 'radial') return `radial-gradient(${gradientOrientation.value}, ${stops})`
    if (gradientType.value === 'conic') return `conic-gradient(${gradientOrientation.value}, ${stops})`
    return `linear-gradient(${gradientOrientation.value}, ${stops})`
  }

  const syncFromGradient = (gradient?: string) => {
    const value = gradient ?? ''
    const typeMatch = value.match(/^\s*(linear|radial|conic)-gradient/i)
    gradientType.value = (typeMatch?.[1]?.toLowerCase() as GradientType) ?? DEFAULT_GRADIENT_TYPE

    const colorMatches = value.match(/#[0-9a-fA-F]{6}/g)
    if (colorMatches?.length) {
      gradientColors.value = [
        colorMatches[0] ?? DEFAULT_GRADIENT_COLORS[0],
        colorMatches[1] ?? colorMatches[0] ?? DEFAULT_GRADIENT_COLORS[1],
        colorMatches[2] ?? colorMatches[1] ?? DEFAULT_GRADIENT_COLORS[2],
        colorMatches[3] ?? colorMatches[2] ?? DEFAULT_GRADIENT_COLORS[3]
      ]
    } else {
      gradientColors.value = [...DEFAULT_GRADIENT_COLORS]
    }

    gradientOrientation.value =
      gradientType.value === 'radial'
        ? RADIAL_ORIENTATIONS[0].value
        : gradientType.value === 'conic'
          ? CONIC_ORIENTATIONS[0].value
          : LINEAR_ORIENTATIONS[4].value
  }

  syncFromGradient(initialGradient)

  return {
    gradientType,
    gradientOrientation,
    gradientColors,
    orientationOptions,
    buildGradient,
    syncFromGradient
  }
}
