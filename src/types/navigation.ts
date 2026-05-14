export const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right'
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]
export type TextSize = 's' | 'm' | 'l'

export interface Panel {
  id: string
  eyebrow: string
  title: string
  description?: string
  useMarkdown?: boolean
  titleSize?: TextSize
  eyebrowSize?: TextSize
  descriptionSize?: TextSize
  panelClass: string
  image?: string
  nextPanelPosition?: Direction
}

export interface ContentSchema {
  autoSnapEnabled?: boolean
  loopEnabled?: boolean
  snapEase?: string
  panels: Panel[]
}
