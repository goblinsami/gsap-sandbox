export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Panel {
  id: string
  eyebrow: string
  title: string
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
