import { reactive, ref, watch, type Ref } from 'vue'
import { Direction, type Panel } from '../types/navigation'

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

const DEFAULT_TEXT_SIZE = 'm' as const
const RANDOM_IMAGE_WIDTH = 2400
const RANDOM_IMAGE_HEIGHT = 1350
const RANDOM_IMAGE_BASE_URL = 'https://picsum.photos'
export const DROP_IMAGE_LOADED_TEXT = 'Image loaded'
export const DROP_IMAGE_EMPTY_TEXT = 'Drop image here or choose file'

const copyPanelToDraft = (panel: Panel, draft: Panel) => {
  draft.id = panel.id
  draft.title = panel.title
  draft.eyebrow = panel.eyebrow
  draft.description = panel.description ?? ''
  draft.useMarkdown = panel.useMarkdown ?? false
  draft.titleSize = panel.titleSize ?? DEFAULT_TEXT_SIZE
  draft.eyebrowSize = panel.eyebrowSize ?? DEFAULT_TEXT_SIZE
  draft.descriptionSize = panel.descriptionSize ?? DEFAULT_TEXT_SIZE
  draft.panelClass = panel.panelClass
  draft.image = panel.image ?? ''
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
    panelClass: '',
    image: '',
    nextPanelPosition: Direction.Down
  })

  const fileInputRef = ref<HTMLInputElement | null>(null)
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

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      draft.image = typeof reader.result === 'string' ? reader.result : ''
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

  const onDropImage = (event: DragEvent) => {
    isDragging.value = false
    const file = event.dataTransfer?.files?.[0]
    if (file) readImageFile(file)
  }

  const clearImage = () => {
    draft.image = ''
    save()
  }

  const setRandomImage = () => {
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    draft.image = `${RANDOM_IMAGE_BASE_URL}/${RANDOM_IMAGE_WIDTH}/${RANDOM_IMAGE_HEIGHT}?random=${seed}`
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
    isDragging,
    openFilePicker,
    onFileChange,
    onDropImage,
    clearImage,
    setRandomImage,
    save,
    resetDraft
  }
}
