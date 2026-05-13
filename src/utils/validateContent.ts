import type { ContentSchema, Direction, Panel } from '../types/navigation'

const VALID_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']
const VALID_TEXT_SIZES = ['s', 'm', 'l'] as const

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}

export interface ValidationResult {
  ok: boolean
  errors: string[]
}

export function validateContentSchema(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['content.json debe ser un objeto válido.'] }
  }

  const content = raw as Partial<ContentSchema>
  if (!Array.isArray(content.panels) || content.panels.length === 0) {
    return { ok: false, errors: ['content.json debe incluir panels con al menos un elemento.'] }
  }

  const ids = new Set<string>()

  content.panels.forEach((panel, index) => {
    const label = `Panel ${index + 1}`
    const p = panel as Partial<Panel>

    if (!p || typeof p !== 'object') {
      errors.push(`${label}: valor inválido.`)
      return
    }

    if (typeof p.id !== 'string' || p.id.trim() === '') {
      errors.push(`${label}: id obligatorio.`)
    } else if (ids.has(p.id)) {
      errors.push(`${label}: id duplicado (${p.id}).`)
    } else {
      ids.add(p.id)
    }

    if (typeof p.title !== 'string' || p.title.trim() === '') {
      errors.push(`${label}: title obligatorio.`)
    }

    if (p.description !== undefined && typeof p.description !== 'string') {
      errors.push(`${label}: description debe ser string.`)
    }

    if (p.useMarkdown !== undefined && typeof p.useMarkdown !== 'boolean') {
      errors.push(`${label}: useMarkdown debe ser boolean.`)
    }

    if (p.titleSize !== undefined && !VALID_TEXT_SIZES.includes(p.titleSize)) {
      errors.push(`${label}: titleSize inválido (${String(p.titleSize)}).`)
    }

    if (p.eyebrowSize !== undefined && !VALID_TEXT_SIZES.includes(p.eyebrowSize)) {
      errors.push(`${label}: eyebrowSize inválido (${String(p.eyebrowSize)}).`)
    }

    if (p.descriptionSize !== undefined && !VALID_TEXT_SIZES.includes(p.descriptionSize)) {
      errors.push(`${label}: descriptionSize inválido (${String(p.descriptionSize)}).`)
    }

    if (typeof p.eyebrow !== 'string') {
      errors.push(`${label}: eyebrow debe ser string.`)
    }

    if (typeof p.panelClass !== 'string') {
      errors.push(`${label}: panelClass debe ser string.`)
    }

    if (p.image !== undefined && typeof p.image !== 'string') {
      errors.push(`${label}: image debe ser string.`)
    }

    if (p.nextPanelPosition !== undefined && !VALID_DIRECTIONS.includes(p.nextPanelPosition)) {
      errors.push(`${label}: nextPanelPosition inválido (${String(p.nextPanelPosition)}).`)
    }
  })

  for (let i = 0; i < content.panels.length - 1; i += 1) {
    const currentDir = (content.panels[i].nextPanelPosition ?? 'down') as Direction
    const nextDir = (content.panels[i + 1].nextPanelPosition ?? 'down') as Direction

    if (nextDir === OPPOSITE[currentDir]) {
      errors.push(
        `Regla de flujo: panel ${i + 2} no puede ser '${nextDir}' justo después de '${currentDir}' (panel ${i + 1}).`
      )
    }
  }

  return { ok: errors.length === 0, errors }
}
