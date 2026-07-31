import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/core'
import { useAiRewrite, type RewriteMode } from '../../hooks/useAiRewrite'

const MODES: ReadonlyArray<[RewriteMode, string]> = [
  ['polish', '润色'],
  ['expand', '扩写'],
  ['shrink', '缩写'],
  ['restyle', '换风格']
]

/** 选区浮层:非空选区时显示改写模式按钮 */
export function RewriteBubble({ editor }: { editor: Editor | null }) {
  const [sel, setSel] = useState('')
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const rewrite = useAiRewrite()

  useEffect(() => {
    if (!editor) return
    const handler = () => {
      const { from, to, empty } = editor.state.selection
      if (empty) { setPos(null); return }
      const text = editor.state.doc.textBetween(from, to, '\n')
      const coords = editor.view.coordsAtPos(from)
      setSel(text)
      setPos({ x: coords.left, y: coords.top - 40 })
    }
    editor.on('selectionUpdate', handler)
    return () => { editor.off('selectionUpdate', handler) }
  }, [editor])

  if (!pos) return null
  return (
    <div
      className="fixed z-50 flex gap-1 rounded-lg border bg-white p-1 shadow"
      style={{ left: pos.x, top: pos.y }}
    >
      {MODES.map(([m, label]) => (
        <button
          key={m}
          onClick={() => { rewrite(sel, m); setPos(null) }}
          className="rounded-full px-2 py-0.5 text-xs hover:bg-indigo-100"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
