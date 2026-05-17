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

export interface PanelCta {
  label: string
  linkKey: string
}

export const TemplateType = {
  Scroll: 'scroll',
  StackCards: 'stack-cards'
} as const

export const TemplateTypeValues = [TemplateType.Scroll, TemplateType.StackCards] as const

export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType]

export interface StackCardItem {
  title: string
  description: string
  color: string
  image?: string
}

export interface StackCardsSettings {
  textSide?: 'left' | 'right'
  angleY?: number
  angleX?: number
  cardGap?: number
  frontFadeWindow?: number
  cardSize?: number
  cardWidth?: number
  wheelSensitivity?: number
  autoPlayEnabled?: boolean
  autoPlaySpeed?: number
  cards: StackCardItem[]
}

export interface Panel {
  id: string
  eyebrow: string
  title: string
  description?: string
  templateType?: TemplateType
  stackCards?: StackCardsSettings
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
  contentSidePadding?: number
  titleMaxWidth?: number
  descriptionMaxWidth?: number
  panelClass: string
  panelColor?: string
  image?: string
  logo?: string
  logoSize?: TextSize
  logoTintEnabled?: boolean
  logoTintColor?: string
  backgroundGradient?: string
  overlayEnabled?: boolean
  overlayIntensity?: number
  ctaText?: string
  ctaLink?: string
  cta?: PanelCta
  nextPanelPosition?: Direction
}

export interface ContentSchema {
  autoSnapEnabled?: boolean
  enableCtas?: boolean
  loopEnabled?: boolean
  enableLoop?: boolean
  snapEase?: string
  transitionSpeed?: number
  autoPlayEnabled?: boolean
  autoPlaySpeed?: number
  watermarkEnabled?: boolean
  panels: Panel[]
}
