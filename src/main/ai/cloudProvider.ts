import type { AiProvider, GenerateContext } from './provider'

interface CloudOpts { apiKey: string; model: string; baseUrl: string }

export class CloudProvider implements AiProvider {
  private opts: CloudOpts
  // 可注入以便测试
  public fetchImpl: (url: string, init: RequestInit) => Promise<Response> = (url, init) => fetch(url, init)

  constructor(opts: CloudOpts) { this.opts = opts }

  async *generate(ctx: GenerateContext, o: { maxTokens?: number; temperature?: number; signal?: AbortSignal }): AsyncIterable<string> {
    const messages = buildMessages(ctx)
    const res = await this.fetchImpl(`${this.opts.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.opts.apiKey}` },
      signal: o.signal,
      body: JSON.stringify({ model: this.opts.model, messages, stream: true, max_tokens: o.maxTokens ?? 1024, temperature: o.temperature ?? 0.8 })
    })
    if (!res.ok || !res.body) throw new Error(`AI 请求失败: ${res.status} ${await res.text().catch(() => '')}`)
    yield* parseSse(res.body)
  }
}

async function* parseSse(body: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return
      try { const json = JSON.parse(data); const delta = json.choices?.[0]?.delta?.content; if (delta) yield delta } catch { /* ignore */ }
    }
  }
}

function buildMessages(ctx: GenerateContext): { role: string; content: string }[] {
  const charBrief = ctx.characters.map(c => `- ${c.name}(${c.role}):${c.personality}`).join('\n')
  const setBrief = ctx.settings.map(s => `- ${s.category}·${s.name}:${s.description}`).join('\n')
  if (ctx.task === 'continue') {
    return [
      { role: 'system', content: `你是小说续写助手,保持人物性格与前文连贯,只输出续写正文。\n人物:\n${charBrief}\n设定:\n${setBrief}` },
      { role: 'user', content: `前文:\n${ctx.sourceText}\n\n续写要求:${ctx.instruction || '自然续写'}` }
    ]
  }
  return [
    { role: 'system', content: '你是小说改写助手,按指令改写,只输出改写后正文。' },
    { role: 'user', content: `原文:\n${ctx.sourceText}\n\n改写指令:${ctx.instruction}` }
  ]
}
