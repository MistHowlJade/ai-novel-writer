import type { Editor } from '@tiptap/core'

/** 在 doc 中查找指定 requestId 的 aiBlock 节点位置 */
export function findAiBlockPos(editor: Editor, requestId: string): number | null {
  let found: number | null = null
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'aiBlock' && node.attrs.requestId === requestId) {
      found = pos
      return false
    }
    return true
  })
  return found
}

/** 在 AiBlock 末尾段落追加文本 */
export function appendToAiBlock(editor: Editor, requestId: string, chunk: string): void {
  const pos = findAiBlockPos(editor, requestId)
  if (pos === null) return
  const block = editor.state.doc.nodeAt(pos)
  if (!block) return
  // end = AiBlock 内容区末尾位置(闭合标签前);end-1 即最后一段落的文本末尾
  const end = pos + block.nodeSize - 1
  editor.view.dispatch(editor.state.tr.insertText(chunk, end - 1))
}

/** 将 AiBlock 的 status 属性改为 'preview'(保留 task/requestId) */
export function markPreview(editor: Editor, requestId: string): void {
  const pos = findAiBlockPos(editor, requestId)
  if (pos === null) return
  const node = editor.state.doc.nodeAt(pos)
  if (!node) return
  editor.view.dispatch(
    editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, status: 'preview' })
  )
}
