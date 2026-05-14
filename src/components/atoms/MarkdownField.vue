<template>
  <div class="md-editor">
    <div class="md-editor__toolbar">
      <button type="button" @click="wrap('**', '**')"><strong>B</strong></button>
      <button type="button" @click="wrap('*', '*')"><em>I</em></button>
      <button type="button" @click="insert('[text](https://example.com)')">Link</button>
      <button type="button" @click="insert('<span style=&quot;color:#C0392B&quot;>color</span>')">Color</button>
    </div>
    <textarea :rows="rows" :value="modelValue" @input="onInput" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  rows?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

const insert = (snippet: string) => {
  emit('update:modelValue', `${props.modelValue}${props.modelValue ? '\n' : ''}${snippet}`)
}

const wrap = (before: string, after: string) => {
  emit('update:modelValue', `${props.modelValue}${before}text${after}`)
}
</script>

