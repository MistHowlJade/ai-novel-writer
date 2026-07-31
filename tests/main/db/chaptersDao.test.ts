import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initDb, closeDb } from '../../../src/main/db'
import { createProject } from '../../../src/main/db/dao/projects'
import { createVolume } from '../../../src/main/db/dao/volumes'
import { createChapter, saveChapter, getChapter, countWords } from '../../../src/main/db/dao/chapters'

describe('chapters dao', () => {
  let chapterId: string
  beforeEach(() => {
    initDb(':memory:')
    const p = createProject({ title: 't' })
    const v = createVolume({ project_id: p.id, title: 'v' })
    chapterId = createChapter({ volume_id: v.id, title: 'c' }).id
  })
  afterEach(() => closeDb())

  it('saveChapter 写回字数(中文+英文)', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '你好 world' }] }] }
    const r = saveChapter(chapterId, JSON.stringify(doc))
    expect(r.word_count).toBe(3) // 2 中文 + 1 英文单词
    const got = getChapter(chapterId)!
    expect(got.word_count).toBe(r.word_count)
  })

  it('countWords 对纯文本与 JSON 一致', () => {
    expect(countWords('你好世界 hello')).toBe(4 + 1)
  })
})
