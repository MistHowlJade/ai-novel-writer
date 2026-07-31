import { v4 as uuid } from 'uuid'
import type { Editor } from '@tiptap/core'
import { useEditorStore } from '../stores/editorStore'
import { useAiStore } from '../stores/aiStore'
import { appendToAiBlock, markPreview } from '../editor/aiBlockOps'

export type RewriteMode = 'polish' | 'expand' | 'shrink' | 'restyle'

/** 改写 hook:先删除选中文本,再插入流式 AiBlock(接受后即替换原选区) */
export function useAiRewrite() {
  return async function rewrite(selection: string, mode: RewriteMode) {
    const editor = (window as any).__editor as Editor | null
    const chapterId = useEditorStore.getState().currentChapterId
    if (!editor || !chapterId || !selection) return
    const requestId = uuid()

    // 先删除选中文本,这样接受 AiBlock 后内容即替换原选区
    editor.chain().focus().deleteSelection().run()
    editor.chain().focus().insertContent({
      type: 'aiBlock',
      attrs: { status: 'streaming', task: 'rewrite', requestId },
      content: [{ type: 'paragraph' }]
    }).run()

    useAiStore.getState().start(requestId)

    const offChunk = window.api.ai.onChunk((e) => {
      if (e.requestId !== requestId) return
      appendToAiBlock(editor, requestId, e.chunk)
    })
    const offDone = window.api.ai.onDone((e) => {
      if (e.requestId !== requestId) return
      markPreview(editor, requestId)
      useAiStore.getState().done()
    })
    const offErr = window.api.ai.onError((e) => {
      if (e.requestId !== requestId) return
      useAiStore.getState().fail(e.message)
    })

    await window.api.ai.generate({ requestId, task: 'rewrite', chapterId, instruction: selection, mode })
    offChunk()
    offDone()
    offErr()
  }
}
