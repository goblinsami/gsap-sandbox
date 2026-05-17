export const SlidePropertiesSection = {
  TextContent: 'textContent',
  Ctas: 'ctas',
  TextStyle: 'textStyle',
  Fill: 'gradientEditor',
  Logo: 'logoEditor',
  Image: 'imageEditor'
} as const

export type SlidePropertiesSection = (typeof SlidePropertiesSection)[keyof typeof SlidePropertiesSection]

// Add one or more section keys to open them by default.
// Leave as [] to keep all sections closed by default.
export const DEFAULT_OPEN_SLIDE_PROPERTIES_SECTIONS: SlidePropertiesSection[] = [
  SlidePropertiesSection.TextContent]
