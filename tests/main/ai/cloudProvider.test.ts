import { describe, it, expect } from 'vitest'
import { CloudProvider } from '../../../src/main/ai/cloudProvider'

// 用伪 SSE body 模拟云端流式响应
function sseBody(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })
}

describe('CloudProvider', () => {
  it('解析 SSE 并逐 chunk yield', async () => {
    const provider = new CloudProvider({ apiKey: 'k', model: 'm', baseUrl: 'http://x' })
    // @ts-expect-error 注入伪 fetch
    provider.fetchImpl = async () => new Response(sseBody(['你', '好', '世界']))
    const out: string[] = []
    for await (const c of provider.generate({ task: 'continue', sourceText: '前文', instruction: '', characters: [], settings: [] }, {})) out.push(c)
    expect(out.join('')).toBe('你好世界')
  })
})
