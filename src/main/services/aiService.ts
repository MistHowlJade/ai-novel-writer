import type { AiGenerateRequest } from '../../shared/ipc'
import { getChapter } from '../db/dao/chapters'
import { listCharacters } from '../db/dao/characters'
import { listSettings } from '../db/dao/settings'
import { getAiConfig } from '../db/dao/aiConfig'
import { getDb } from '../db'
import { CloudProvider } from '../ai/cloudProvider'
import { assembleContinueContext, assembleRewriteContext } from '../ai/context'
import type { GenerateContext } from '../ai/provider'

const controllers = new Map<string, AbortController>()

export function buildContext(req: AiGenerateRequest): GenerateContext {
  const ch = getChapter(req.chapterId)
  if (!ch) throw new Error('章节不存在')
  const doc = ch.content ? JSON.parse(ch.content) : null
  const text = doc?.content ? toPlainText(doc) : ''
  const chars = listCharacters(getProjectIdByChapter(ch.volume_id))
  const settings = listSettings(getProjectIdByChapter(ch.volume_id))
  if (req.task === 'continue') return assembleContinueContext(text, req.instruction, chars, settings)
  // 改写:选中文本由渲染进程放进 instruction 前缀?这里用 instruction 作为原文占位改写需 sourceText
  // 改写 sourceText 由调用方(AI IPC)单独传入,这里走 rewrite context
  return assembleRewriteContext(req.instruction, req.mode ?? 'polish')
}

// 改写专用:sourceText 为选中文本
export function buildRewriteContext(selected: string, mode: 'polish' | 'expand' | 'shrink' | 'restyle'): GenerateContext {
  return assembleRewriteContext(selected, mode)
}

export async function runGenerate(
  req: AiGenerateRequest,
  ctx: GenerateContext,
  onChunk: (chunk: string) => void
): Promise<void> {
  const cfg = getAiConfig()
  if (cfg.provider !== 'cloud') throw new Error('本地 provider 暂未实现')
  const provider = new CloudProvider({ apiKey: cfg.api_key, model: cfg.model, baseUrl: cfg.base_url || 'https://api.deepseek.com/v1' })
  const ac = new AbortController()
  controllers.set(req.requestId, ac)
  try {
    for await (const chunk of provider.generate(ctx, { signal: ac.signal })) onChunk(chunk)
  } finally {
    controllers.delete(req.requestId)
  }
}

export function cancelGenerate(requestId: string): void {
  controllers.get(requestId)?.abort()
  controllers.delete(requestId)
}

// ---- helpers ----
function getProjectIdByChapter(volumeId: string): string {
  return (getDb().prepare('SELECT project_id FROM volumes WHERE id=?').get(volumeId) as { project_id: string }).project_id
}

/** 递归提取 TipTap JSON 的纯文本 */
function toPlainText(doc: any): string {
  if (doc?.type === 'text') return doc.text ?? ''
  return (doc?.content ?? []).map((c: any) => toPlainText(c)).join('')
}
