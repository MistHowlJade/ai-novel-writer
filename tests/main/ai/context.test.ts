import { describe, it, expect } from 'vitest'
import { assembleContinueContext, assembleRewriteContext } from '../../../src/main/ai/context'
import type { Chapter, Character, Setting } from '../../../src/shared/types'

const chars: Character[] = [{ id: '1', project_id: 'p', name: '林秋', role: '主角', appearance: '', personality: '沉稳', background: '', relations: '' }]
const settings: Setting[] = [{ id: '2', project_id: 'p', category: '地点', name: '客栈', description: '雨夜' }]

describe('context assembly', () => {
  it('续写:取章末 N 字 + 命名匹配到的人物', () => {
    const chapter: Chapter = { id: 'c', volume_id: 'v', title: '', content: '', word_count: 0, sort_order: 0, status: 'draft', updated_at: '' }
    const text = '林秋推开门。'.repeat(500) // 很长
    const ctx = assembleContinueContext(text, '继续', chars, settings)
    expect(ctx.sourceText.length).toBeLessThanOrEqual(2000)
    expect(ctx.characters.map(c => c.name)).toContain('林秋')
    expect(ctx.task).toBe('continue')
  })

  it('改写:选中文本 + 指令', () => {
    const ctx = assembleRewriteContext('选中片段', 'polish')
    expect(ctx.task).toBe('rewrite')
    expect(ctx.sourceText).toBe('选中片段')
    expect(ctx.instruction).toContain('润色')
  })
})
