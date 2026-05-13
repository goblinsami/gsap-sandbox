export type Direction = 'up' | 'down' | 'left' | 'right'
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

export interface PanelBlock {
  type: 'panel'
  panel: Panel
  direction: Direction
}

export interface HorizontalBlock {
  type: 'horizontal'
  panels: Panel[]
  direction: 'left' | 'right'
}

export type RenderBlock = PanelBlock | HorizontalBlock

export interface ContentSchema {
  panels: Panel[]
}
