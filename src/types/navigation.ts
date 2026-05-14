export const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right'
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]

export const TextSize = {
  Small: 's',
  Medium: 'm',
  Large: 'l'
} as const

export const TextSizeValues = [TextSize.Small, TextSize.Medium, TextSize.Large] as const

export type TextSize = (typeof TextSize)[keyof typeof TextSize]

export const ContentAlign = {
  Left: 'left',
  Center: 'center',
  Right: 'right'
} as const

export const ContentAlignValues = [ContentAlign.Left, ContentAlign.Center, ContentAlign.Right] as const

export type ContentAlign = (typeof ContentAlign)[keyof typeof ContentAlign]

export const ContentWidthMode = {
  Contained: 'contained',
  Full: 'full'
} as const

export const ContentWidthModeValues = [ContentWidthMode.Contained, ContentWidthMode.Full] as const

export type ContentWidthMode = (typeof ContentWidthMode)[keyof typeof ContentWidthMode]

export interface Panel {
  id: string
  eyebrow: string
  title: string
  description?: string
  useMarkdown?: boolean
  titleSize?: TextSize
  eyebrowSize?: TextSize
  descriptionSize?: TextSize
  contentAlign?: ContentAlign
  contentWidthMode?: ContentWidthMode
  eyebrowTitleGap?: number
  titleDescriptionGap?: number
  titleLineHeight?: number
  descriptionLineHeight?: number
  eyebrowLetterSpacing?: number
  contentMaxWidth?: number
  titleMaxWidth?: number
  descriptionMaxWidth?: number
  panelClass: string
  image?: string
  overlayEnabled?: boolean
  overlayIntensity?: number
  nextPanelPosition?: Direction
}

export interface ContentSchema {
  autoSnapEnabled?: boolean
  loopEnabled?: boolean
  snapEase?: string
  panels: Panel[]
}
