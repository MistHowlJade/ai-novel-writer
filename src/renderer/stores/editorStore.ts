import { create } from 'zustand'
interface EditorState {
  currentChapterId: string | null
  wordCount: number
  dirty: boolean
  saving: boolean
  setChapter: (id: string | null) => void
  setWordCount: (n: number) => void
  setDirty: (b: boolean) => void
  setSaving: (b: boolean) => void
}
export const useEditorStore = create<EditorState>((set) => ({
  currentChapterId: null, wordCount: 0, dirty: false, saving: false,
  setChapter: (id) => set({ currentChapterId: id, dirty: false }),
  setWordCount: (n) => set({ wordCount: n }),
  setDirty: (b) => set({ dirty: b }),
  setSaving: (b) => set({ saving: b })
}))
