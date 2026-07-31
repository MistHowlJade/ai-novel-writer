import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initDb, closeDb, getDb } from '../../../src/main/db'
import { createProject } from '../../../src/main/db/dao/projects'
import { createVolume } from '../../../src/main/db/dao/volumes'
import { createChapter, saveChapter } from '../../../src/main/db/dao/chapters'
import { buildContext } from '../../../src/main/services/aiService'

describe('aiService 端到端(mock 流式)', () => {
  beforeEach(() => {
    initDb(':memory:')
    const p = createProject({ title: 't' })
    const v = createVolume({ project_id: p.id })
    const ch = createChapter({ volume_id: v.id })
    saveChapter(ch.id, JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '林秋推开门。' }] }] }))
  })
  afterEach(() => closeDb())

  it('buildContext 从章节抽取正文', () => {
    const row = getDb().prepare('SELECT id FROM chapters LIMIT 1').get() as { id: string }
    const ctx = buildContext({ requestId: 'r', task: 'continue', chapterId: row.id, instruction: '继续' })
    expect(ctx.sourceText).toContain('林秋')
    expect(ctx.task).toBe('continue')
  })
})
