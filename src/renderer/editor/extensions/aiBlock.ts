import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { AiBlockView } from '../../components/editor/AiBlockView'

export interface AiBlockAttrs {
  status: 'streaming' | 'preview'
  task: 'continue' | 'rewrite'
  requestId: string
}

export interface AiBlockOptions {
  onRegenerate?: (requestId: string) => void
}

export const AiBlock = Node.create<AiBlockOptions>({
  name: 'aiBlock',
  group: 'block',
  content: 'block+',
  isolating: true,
  defining: true,

  addOptions() {
    return { onRegenerate: undefined }
  },

  addAttributes(): Record<string, any> {
    return {
      status: { default: 'streaming' },
      task: { default: 'continue' },
      requestId: { default: '' }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-ai-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-ai-block': '' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiBlockView)
  }
})
