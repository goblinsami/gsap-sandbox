import type { ContentSchema, Panel } from '../types/navigation'

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i

const WELCOME_GRADIENT_PALETTES = [
  {
    deep: '#060914',
    mid: '#0f1f46',
    glowA: '#8a5bff',
    glowB: '#2fd4ff',
    glowC: '#c66dff'
  },
  {
    deep: '#050713',
    mid: '#17224f',
    glowA: '#d9ff00',
    glowB: '#00c6ff',
    glowC: '#9a67ff'
  },
  {
    deep: '#08061a',
    mid: '#1d1a54',
    glowA: '#7f5cff',
    glowB: '#23a8ff',
    glowC: '#6fe3ff'
  },
  {
    deep: '#070914',
    mid: '#111f5b',
    glowA: '#a25bff',
    glowB: '#ff3d3d',
    glowC: '#ff9500'
  }
] as const

const toRgba = (hexColor: string, alpha: number): string => {
  if (!HEX_COLOR_REGEX.test(hexColor)) return `rgba(0, 0, 0, ${alpha})`
  const value = hexColor.slice(1)
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export const createWelcomeGradient = (index: number): string => {
  const palette = WELCOME_GRADIENT_PALETTES[Math.abs(index) % WELCOME_GRADIENT_PALETTES.length]
  const direction = 128 + (index % 4) * 8
  const firstX = 18 + (index % 4) * 4
  const firstY = 14 + (index % 3) * 3
  const secondX = 82 - (index % 3) * 6
  const secondY = 18 + (index % 4) * 5
  const thirdX = 52 + (index % 2) * 9
  const thirdY = 86 - (index % 4) * 4

  return [
    `radial-gradient(circle at ${firstX}% ${firstY}%, ${toRgba(palette.glowA, 0.54)} 0%, ${toRgba(palette.glowA, 0.12)} 34%, transparent 62%)`,
    `radial-gradient(circle at ${secondX}% ${secondY}%, ${toRgba(palette.glowB, 0.45)} 0%, ${toRgba(palette.glowB, 0.08)} 38%, transparent 66%)`,
    `radial-gradient(circle at ${thirdX}% ${thirdY}%, ${toRgba(palette.glowC, 0.33)} 0%, ${toRgba(palette.glowC, 0.06)} 46%, transparent 72%)`,
    `linear-gradient(${direction}deg, ${palette.deep} 0%, ${palette.mid} 46%, #131b44 100%)`
  ].join(', ')
}

export const applyWelcomeGradientsToPanels = (panels: Panel[]): Panel[] =>
  panels.map((panel, index) => ({
    ...panel,
    image: undefined,
    overlayEnabled: false,
    backgroundGradient: createWelcomeGradient(index)
  }))

export const applyWelcomeGradientsToContent = (content: ContentSchema): ContentSchema => ({
  ...content,
  panels: applyWelcomeGradientsToPanels(content.panels ?? [])
})
