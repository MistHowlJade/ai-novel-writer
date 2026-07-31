import { useState } from 'react'
import { useAiContinue } from '../../hooks/useAiContinue'
import { useAiStore } from '../../stores/aiStore'

export function AiPanel() {
  const [instruction, setInstruction] = useState('')
  const continueWrite = useAiContinue()
  const streaming = useAiStore(s => s.streaming)
  const error = useAiStore(s => s.error)

  return (
    <div>
      <div className="mb-2 font-medium">AI 续写</div>
      <textarea
        value={instruction}
        onChange={e => setInstruction(e.target.value)}
        placeholder="续写方向(可选)"
        className="h-24 w-full rounded border p-2 text-sm"
      />
      <button
        disabled={streaming}
        onClick={() => continueWrite(instruction)}
        className="mt-2 w-full rounded bg-indigo-600 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {streaming ? '生成中…' : '续写'}
      </button>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      <button
        disabled={!streaming}
        onClick={() => {
          const id = useAiStore.getState().requestId
          if (id) window.api.ai.onCancel(id)
        }}
        className="mt-1 w-full rounded border py-1 text-xs disabled:opacity-50"
      >
        取消
      </button>
    </div>
  )
}
