import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { AiBlock } from '../../editor/extensions/aiBlock'
import { useEditorStore } from '../../stores/editorStore'

const AUTOSAVE_MS = 1500

export function Editor() {
  const chapterId = useEditorStore(s => s.currentChapterId)
  const setWordCount = useEditorStore(s => s.setWordCount)
  const setDirty = useEditorStore(s => s.setDirty)
  const setSaving = useEditorStore(s => s.setSaving)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // onUpdate 在 editor 创建时绑定一次,闭包捕获的 chapterId 不会更新,用 ref 取最新值
  const chapterIdRef = useRef<string | null>(chapterId)
  chapterIdRef.current = chapterId
  // setContent 会同步触发 onUpdate,加载章节时用此标志跳过自动保存
  const loadingRef = useRef(false)

  const editor = useEditor({
    extensions: [StarterKit, AiBlock],
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      if (loadingRef.current) return
      setDirty(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        const id = chapterIdRef.current
        if (!id) return
        setSaving(true)
        try {
          const r = await window.api.chapter.save(id, JSON.stringify(editor.getJSON()))
          setWordCount(r.word_count)
          setDirty(false)
        } finally {
          setSaving(false)
        }
      }, AUTOSAVE_MS)
    }
  })

  // 切换章节:加载内容并设置;用 loadingRef 拦截 setContent 引发的 onUpdate
  useEffect(() => {
    if (!editor || !chapterId) return
    loadingRef.current = true
    clearTimeout(timer.current)
    window.api.chapter.get(chapterId).then(ch => {
      if (ch?.content) editor.commands.setContent(JSON.parse(ch.content))
      else editor.commands.setContent({ type: 'doc', content: [{ type: 'paragraph' }] })
      setWordCount(ch?.word_count ?? 0)
      setDirty(false)
    }).finally(() => {
      loadingRef.current = false
    })
  }, [editor, chapterId, setWordCount, setDirty])

  // 暴露 editor 到全局,供后续 Task 13/14 的 AI hooks 使用
  useEffect(() => {
    ;(window as any).__editor = editor
    return () => {
      ;(window as any).__editor = null
    }
  }, [editor])

  // 卸载时清理待执行的自动保存定时器
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-3xl p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
