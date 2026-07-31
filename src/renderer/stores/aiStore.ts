import { create } from 'zustand'
interface AiState {
  requestId: string | null
  streaming: boolean
  error: string | null
  start: (id: string) => void
  append: () => void
  done: () => void
  fail: (msg: string) => void
}
export const useAiStore = create<AiState>((set) => ({
  requestId: null, streaming: false, error: null,
  start: (id) => set({ requestId: id, streaming: true, error: null }),
  append: () => {},
  done: () => set({ streaming: false }),
  fail: (msg) => set({ streaming: false, error: msg })
}))
