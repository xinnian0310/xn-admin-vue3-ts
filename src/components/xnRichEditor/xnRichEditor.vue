<template>
  <div class="rich-editor xn-rich-editor" :class="{ 'is-disabled': disabled }">
    <Toolbar
      v-if="!disabled"
      class="rich-editor__toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
    />
    <Editor
      class="rich-editor__body"
      :style="{ height }"
      v-model="valueHtml"
      :default-config="editorConfig"
      mode="default"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import 'katex/dist/katex.min.css'
import {
  createMentionConfig,
  createRichEditorConfig,
  createRichToolbarConfig,
} from '@/utils/rich-editor'
import '@/utils/rich-editor/styles.css'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    disabled?: boolean
    height?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    disabled: false,
    height: '320px',
    placeholder: '请输入公告内容',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = shallowRef<IDomEditor>()
const mention = createMentionConfig()
const toolbarConfig = createRichToolbarConfig()

const valueHtml = computed({
  get: () => props.modelValue || '',
  set: (val: string) => emit('update:modelValue', val),
})

const editorConfig = computed(() =>
  createRichEditorConfig({
    placeholder: props.placeholder,
    readOnly: props.disabled,
    mention,
  }),
)

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor
}

onBeforeUnmount(() => {
  mention.dispose()
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  background: var(--app-card-bg, #fff);
}

.rich-editor__toolbar {
  border-bottom: 1px solid var(--el-border-color);
}

.rich-editor__body {
  overflow-y: auto;
}

.rich-editor.is-disabled {
  background: var(--el-fill-color-light);
}
</style>
