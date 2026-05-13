import type { ContentSchema, Direction, Panel } from '../types/navigation'

const VALID_DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right']

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

    if (typeof p.eyebrow !== 'string') {
      errors.push(`${label}: eyebrow debe ser string.`)
    }

    if (typeof p.panelClass !== 'string') {
      errors.push(`${label}: panelClass debe ser string.`)
    }

    if (p.nextPanelPosition !== undefined && !VALID_DIRECTIONS.includes(p.nextPanelPosition)) {
      errors.push(`${label}: nextPanelPosition inválido (${String(p.nextPanelPosition)}).`)
    }
  })

  // Direction transition rule: no consecutive opposite directions.
  // Example requested: if panel 1 is down, panel 2 can't be up.
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
