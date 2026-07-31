import { v4 as uuid } from 'uuid'
import type { Editor } from '@tiptap/core'
import { useEditorStore } from '../stores/editorStore'
import { useAiStore } from '../stores/aiStore'
import { appendToAiBlock, markPreview } from '../editor/aiBlockOps'

/** 续写 hook:在光标处插入流式 AiBlock 并驱动 AI 生成 */
export function useAiContinue() {
  return async function continueWrite(instruction: string) {
    const editor = (window as any).__editor as Editor | null
    const chapterId = useEditorStore.getState().currentChapterId
    if (!editor || !chapterId) return
    const requestId = uuid()

    // 在光标处插入空 AiBlock
    editor.chain().focus().insertContent({
      type: 'aiBlock',
      attrs: { status: 'streaming', task: 'continue', requestId },
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

    await window.api.ai.generate({ requestId, task: 'continue', chapterId, instruction })
    offChunk()
    offDone()
    offErr()
  }
}
