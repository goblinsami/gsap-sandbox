export interface FlowEditorExposed {
  openSlideSettings: (index: number) => void
  toggleFlowEditor: () => boolean
  isFlowEditorOpen: () => boolean
}
