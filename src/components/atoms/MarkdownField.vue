<template>
  <div class="md-editor">
    <div class="md-editor__toolbar">
      <button type="button" @click="wrap('**', '**')"><strong>B</strong></button>
      <button type="button" @click="wrap('*', '*')"><em>I</em></button>
      <button type="button" @click="insert('[text](https://example.com)')">Link</button>
      <button type="button" @click="insert('<span style=&quot;color:#C0392B&quot;>color</span>')">Color</button>
    </div>
    <textarea ref="textareaRef" :rows="rows" :value="modelValue" @input="onInput" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = defineProps<{
  modelValue: string
  rows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

const insert = (snippet: string) => {
  emit('update:modelValue', `${props.modelValue}${props.modelValue ? '\n' : ''}${snippet}`)
}

const wrap = (before: string, after: string) => {
  const textarea = textareaRef.value
  const value = props.modelValue ?? ''

  if (!textarea) {
    emit('update:modelValue', `${value}${before}text${after}`)
    return
  }

  const start = textarea.selectionStart ?? value.length
  const end = textarea.selectionEnd ?? value.length
  const selectedText = value.slice(start, end)
  const fallbackText = 'text'
  const textToWrap = selectedText || fallbackText

  const nextValue = `${value.slice(0, start)}${before}${textToWrap}${after}${value.slice(end)}`
  emit('update:modelValue', nextValue)

  const selectionStart = start + before.length
  const selectionEnd = selectionStart + textToWrap.length

  void nextTick(() => {
    const target = textareaRef.value
    if (!target) return
    target.focus()
    target.setSelectionRange(selectionStart, selectionEnd)
  })
}
</script>
