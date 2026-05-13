import type { Direction } from '../types/navigation'

const ARROWS: Record<Direction, string> = {
  up: '⬆️',
  down: '⬇️',
  left: '⬅️',
  right: '➡️'
}

export function getDirectionArrow(direction?: Direction): string {
  return ARROWS[direction ?? 'down']
}
