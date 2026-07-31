import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { type AiBlockAttrs } from '../../editor/extensions/aiBlock'

export function AiBlockView(props: NodeViewProps) {
  const { node, deleteNode, editor, getPos, extension } = props
  const attrs = node.attrs as AiBlockAttrs
  const { status, task, requestId } = attrs

  function accept() {
    // 把 AiBlock 内的子节点内容 unwrap 为普通段落插入到 AiBlock 之后,再删除 AiBlock
    const pos = getPos()
    if (typeof pos !== 'number') return
    const childContent = node.content.toJSON()
    editor.chain().focus().insertContentAt(pos + node.nodeSize, childContent).run()
    deleteNode()
  }

  function regenerate() {
    extension.options.onRegenerate?.(requestId)
  }

  return (
    <NodeViewWrapper className="my-2">
      <div className="rounded-lg border border-indigo-400 bg-indigo-50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
            AI · {task === 'continue' ? '续写' : '改写'} · {status === 'streaming' ? '生成中' : '预览'}
          </span>
        </div>
        <div className="prose max-w-none text-indigo-900">
          <NodeViewContent />
        </div>
        {status === 'preview' && (
          <div className="mt-2 flex gap-2">
            <button onClick={accept} className="rounded-full bg-indigo-600 px-3 py-1 text-xs text-white">接受</button>
            <button onClick={deleteNode} className="rounded-full border px-3 py-1 text-xs">丢弃</button>
            <button onClick={regenerate} className="rounded-full border px-3 py-1 text-xs">重生</button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
