import { reactive, ref, watch, type Ref } from 'vue'
import { ContentAlign, Direction, type Panel } from '../types/navigation'
import {
  DEFAULT_CONTENT_ALIGN,
  DEFAULT_CONTENT_MAX_WIDTH,
  DEFAULT_CONTENT_WIDTH_MODE,
  DEFAULT_DESCRIPTION_LINE_HEIGHT,
  DEFAULT_DESCRIPTION_MAX_WIDTH,
  DEFAULT_EYEBROW_LETTER_SPACING,
  DEFAULT_EYEBROW_TITLE_GAP,
  DEFAULT_OVERLAY_ENABLED_WITHOUT_IMAGE,
  DEFAULT_OVERLAY_ENABLED_WITH_IMAGE,
  DEFAULT_OVERLAY_INTENSITY,
  DEFAULT_TEXT_SIZE,
  DEFAULT_TITLE_DESCRIPTION_GAP,
  DEFAULT_TITLE_LINE_HEIGHT,
  DEFAULT_TITLE_MAX_WIDTH,
  MAX_CONTENT_MAX_WIDTH,
  MAX_DESCRIPTION_LINE_HEIGHT,
  MAX_DESCRIPTION_MAX_WIDTH,
  MAX_EYEBROW_LETTER_SPACING,
  MAX_EYEBROW_TITLE_GAP,
  MAX_OVERLAY_INTENSITY,
  MAX_TITLE_LINE_HEIGHT,
  MAX_TITLE_MAX_WIDTH,
  MIN_CONTENT_MAX_WIDTH,
  MIN_DESCRIPTION_LINE_HEIGHT,
  MIN_DESCRIPTION_MAX_WIDTH,
  MIN_EYEBROW_LETTER_SPACING,
  MIN_EYEBROW_TITLE_GAP,
  MIN_OVERLAY_INTENSITY,
  MIN_TITLE_LINE_HEIGHT,
  MIN_TITLE_MAX_WIDTH,
  TEXT_STYLE_RANGES,
  clampNumber,
  deriveDescriptionMaxWidthFromContent,
  deriveTitleMaxWidthFromContent
} from '../constants/slideStyle'

export const panelClassOptions = [
  { value: '', label: 'Default' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'outro', label: 'Outro Blue' },
  { value: 'red', label: 'Red' },
  { value: 'danger', label: 'Danger' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'violet', label: 'Violet' },
  { value: 'amber', label: 'Amber' }
]

export const contentAlignOptions: Array<{ value: ContentAlign; label: string }> = [
  { value: ContentAlign.Left, label: 'Left' },
  { value: ContentAlign.Center, label: 'Center' },
  { value: ContentAlign.Right, label: 'Right' }
]

const RANDOM_IMAGE_WIDTH = 2400
const RANDOM_IMAGE_HEIGHT = 1350
const RANDOM_IMAGE_BASE_URL = 'https://picsum.photos'
export const DROP_IMAGE_LOADED_TEXT = 'Image loaded'
export const DROP_IMAGE_EMPTY_TEXT = 'Drop image here or choose file'
export const DROP_LOGO_LOADED_TEXT = 'Logo loaded'
export const DROP_LOGO_EMPTY_TEXT = 'Paste logo URL or choose file'
export const DEFAULT_LOGO_TINT_COLOR = '#ffffff'
export const textStyleRanges = TEXT_STYLE_RANGES

const clampOverlayIntensity = (value: number) => {
  if (Number.isNaN(value)) return DEFAULT_OVERLAY_INTENSITY
  return Math.max(MIN_OVERLAY_INTENSITY, Math.min(MAX_OVERLAY_INTENSITY, value))
}


const copyPanelToDraft = (panel: Panel, draft: Panel) => {
  draft.id = panel.id
  draft.title = panel.title
  draft.eyebrow = panel.eyebrow
  draft.description = panel.description ?? ''
  draft.useMarkdown = panel.useMarkdown ?? false
  draft.titleSize = panel.titleSize ?? DEFAULT_TEXT_SIZE
  draft.eyebrowSize = panel.eyebrowSize ?? DEFAULT_TEXT_SIZE
  draft.descriptionSize = panel.descriptionSize ?? DEFAULT_TEXT_SIZE
  draft.contentAlign = panel.contentAlign ?? DEFAULT_CONTENT_ALIGN
  draft.contentWidthMode = panel.contentWidthMode ?? DEFAULT_CONTENT_WIDTH_MODE
  const unifiedTextGap = clampNumber(
    panel.eyebrowTitleGap ?? panel.titleDescriptionGap,
    MIN_EYEBROW_TITLE_GAP,
    MAX_EYEBROW_TITLE_GAP,
    DEFAULT_EYEBROW_TITLE_GAP
  )
  draft.eyebrowTitleGap = unifiedTextGap
  draft.titleDescriptionGap = unifiedTextGap
  draft.titleLineHeight = clampNumber(
    panel.titleLineHeight,
    MIN_TITLE_LINE_HEIGHT,
    MAX_TITLE_LINE_HEIGHT,
    DEFAULT_TITLE_LINE_HEIGHT
  )
  draft.descriptionLineHeight = clampNumber(
    panel.descriptionLineHeight,
    MIN_DESCRIPTION_LINE_HEIGHT,
    MAX_DESCRIPTION_LINE_HEIGHT,
    DEFAULT_DESCRIPTION_LINE_HEIGHT
  )
  draft.eyebrowLetterSpacing = clampNumber(
    panel.eyebrowLetterSpacing,
    MIN_EYEBROW_LETTER_SPACING,
    MAX_EYEBROW_LETTER_SPACING,
    DEFAULT_EYEBROW_LETTER_SPACING
  )
  const contentMaxWidth = clampNumber(
    panel.contentMaxWidth,
    MIN_CONTENT_MAX_WIDTH,
    MAX_CONTENT_MAX_WIDTH,
    DEFAULT_CONTENT_MAX_WIDTH
  )
  draft.contentMaxWidth = contentMaxWidth
  draft.titleMaxWidth = clampNumber(
    panel.titleMaxWidth,
    MIN_TITLE_MAX_WIDTH,
    MAX_TITLE_MAX_WIDTH,
    deriveTitleMaxWidthFromContent(contentMaxWidth)
  )
  draft.descriptionMaxWidth = clampNumber(
    panel.descriptionMaxWidth,
    MIN_DESCRIPTION_MAX_WIDTH,
    MAX_DESCRIPTION_MAX_WIDTH,
    deriveDescriptionMaxWidthFromContent(contentMaxWidth)
  )
  draft.panelClass = panel.panelClass
  draft.image = panel.image ?? ''
  draft.logo = panel.logo ?? ''
  draft.logoTintEnabled = panel.logoTintEnabled ?? true
  draft.logoTintColor = panel.logoTintColor ?? DEFAULT_LOGO_TINT_COLOR
  draft.backgroundGradient = panel.backgroundGradient
  draft.overlayEnabled =
    panel.overlayEnabled ??
    (panel.image ? DEFAULT_OVERLAY_ENABLED_WITH_IMAGE : DEFAULT_OVERLAY_ENABLED_WITHOUT_IMAGE)
  draft.overlayIntensity = clampOverlayIntensity(panel.overlayIntensity ?? DEFAULT_OVERLAY_INTENSITY)
  draft.nextPanelPosition = panel.nextPanelPosition ?? Direction.Down
}

interface UseSlidePropertiesFormOptions {
  panelRef: Ref<Panel | null>
  emitSave: (panel: Panel) => void
}

export function useSlidePropertiesForm(options: UseSlidePropertiesFormOptions) {
  const draft = reactive<Panel>({
    id: '',
    title: '',
    eyebrow: '',
    description: '',
    useMarkdown: false,
    titleSize: DEFAULT_TEXT_SIZE,
    eyebrowSize: DEFAULT_TEXT_SIZE,
    descriptionSize: DEFAULT_TEXT_SIZE,
    contentAlign: DEFAULT_CONTENT_ALIGN,
    contentWidthMode: DEFAULT_CONTENT_WIDTH_MODE,
    eyebrowTitleGap: DEFAULT_EYEBROW_TITLE_GAP,
    titleDescriptionGap: DEFAULT_TITLE_DESCRIPTION_GAP,
    titleLineHeight: DEFAULT_TITLE_LINE_HEIGHT,
    descriptionLineHeight: DEFAULT_DESCRIPTION_LINE_HEIGHT,
    eyebrowLetterSpacing: DEFAULT_EYEBROW_LETTER_SPACING,
    contentMaxWidth: DEFAULT_CONTENT_MAX_WIDTH,
    titleMaxWidth: DEFAULT_TITLE_MAX_WIDTH,
    descriptionMaxWidth: DEFAULT_DESCRIPTION_MAX_WIDTH,
    panelClass: '',
    image: '',
    logo: '',
    logoTintEnabled: true,
    logoTintColor: DEFAULT_LOGO_TINT_COLOR,
    backgroundGradient: undefined,
    overlayEnabled: DEFAULT_OVERLAY_ENABLED_WITHOUT_IMAGE,
    overlayIntensity: DEFAULT_OVERLAY_INTENSITY,
    nextPanelPosition: Direction.Down
  })

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const logoFileInputRef = ref<HTMLInputElement | null>(null)
  const isDragging = ref(false)

  watch(
    () => options.panelRef.value,
    (panel) => {
      if (!panel) return
      copyPanelToDraft(panel, draft)
    },
    { immediate: true }
  )

  const save = () => {
    options.emitSave({ ...draft })
  }

  const openFilePicker = () => {
    fileInputRef.value?.click()
  }

  const openLogoFilePicker = () => {
    logoFileInputRef.value?.click()
  }

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    const hadImage = Boolean(draft.image)
    reader.onload = () => {
      draft.image = typeof reader.result === 'string' ? reader.result : ''
      if (!hadImage && draft.image) {
        draft.overlayEnabled = DEFAULT_OVERLAY_ENABLED_WITH_IMAGE
      }
      save()
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) readImageFile(file)
    target.value = ''
  }

  const readLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      draft.logo = typeof reader.result === 'string' ? reader.result : ''
      save()
    }
    reader.readAsDataURL(file)
  }

  const onLogoFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) readLogoFile(file)
    target.value = ''
  }

  const clearLogo = () => {
    draft.logo = ''
    save()
  }

  const onDropImage = (event: DragEvent) => {
    isDragging.value = false
    const file = event.dataTransfer?.files?.[0]
    if (file) readImageFile(file)
  }

  const clearImage = () => {
    draft.image = ''
    draft.overlayEnabled = DEFAULT_OVERLAY_ENABLED_WITHOUT_IMAGE
    save()
  }

  const setRandomImage = () => {
    const hadImage = Boolean(draft.image)
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    draft.image = `${RANDOM_IMAGE_BASE_URL}/${RANDOM_IMAGE_WIDTH}/${RANDOM_IMAGE_HEIGHT}?random=${seed}`
    if (!hadImage) {
      draft.overlayEnabled = DEFAULT_OVERLAY_ENABLED_WITH_IMAGE
    }
    save()
  }

  const resetDraft = () => {
    const panel = options.panelRef.value
    if (!panel) return
    copyPanelToDraft(panel, draft)
  }

  return {
    draft,
    fileInputRef,
    logoFileInputRef,
    isDragging,
    openFilePicker,
    openLogoFilePicker,
    onFileChange,
    onLogoFileChange,
    onDropImage,
    clearImage,
    clearLogo,
    setRandomImage,
    save,
    resetDraft
  }
}
