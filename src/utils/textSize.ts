import { TextSize, TextSizeValues, type TextSize as SlideTextSize } from '../types/navigation'

const DEFAULT_NORMALIZED_TEXT_SIZE: SlideTextSize = TextSize.Medium

export function normalizeTextSize(
  rawValue: unknown,
  fallback: SlideTextSize = DEFAULT_NORMALIZED_TEXT_SIZE
): SlideTextSize {
  if (typeof rawValue !== 'string') return fallback
  const normalized = rawValue.trim().toLowerCase()
  return (TextSizeValues as readonly string[]).includes(normalized) ? (normalized as SlideTextSize) : fallback
}
