import { v4 as uuid } from 'uuid'
import { getDb } from '../index'
import type { Chapter } from '../../../shared/types'

const now = () => new Date().toISOString()

export function getChapter(id: string): Chapter | undefined {
  return getDb().prepare('SELECT * FROM chapters WHERE id=?').get(id) as Chapter | undefined
}
export function createChapter(input: Partial<Chapter>): Chapter {
  const order = (getDb().prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS n FROM chapters WHERE volume_id=?').get(input.volume_id) as { n: number }).n
  const c: Chapter = {
    id: uuid(), volume_id: input.volume_id!, title: input.title ?? '新章', content: '',
    word_count: 0, sort_order: order, status: 'draft', updated_at: now()
  }
  getDb().prepare('INSERT INTO chapters VALUES (@id,@volume_id,@title,@content,@word_count,@sort_order,@status,@updated_at)').run(c)
  return c
}
export function saveChapter(id: string, content: string): { word_count: number } {
  const wordCount = countWords(content)
  getDb().prepare('UPDATE chapters SET content=?, word_count=?, updated_at=? WHERE id=?').run(content, wordCount, now(), id)
  return { word_count: wordCount }
}
export function reorderChapters(ids: string[]): void {
  const stmt = getDb().prepare('UPDATE chapters SET sort_order=? WHERE id=?')
  ids.forEach((id, i) => stmt.run(i, id))
}
export function updateChapter(id: string, patch: Partial<Chapter>): void {
  if (patch.title !== undefined) getDb().prepare('UPDATE chapters SET title=? WHERE id=?').run(patch.title, id)
  if (patch.status !== undefined) getDb().prepare('UPDATE chapters SET status=? WHERE id=?').run(patch.status, id)
}
export function deleteChapter(id: string): void {
  getDb().prepare('DELETE FROM chapters WHERE id=?').run(id)
}

export function listByVolume(volumeId: string): Chapter[] {
  return getDb().prepare('SELECT * FROM chapters WHERE volume_id=? ORDER BY sort_order').all(volumeId) as Chapter[]
}

/** 从 TipTap JSON 内容提取纯文本并按中文字符+英文单词计字数 */
export function countWords(content: string): number {
  if (!content) return 0
  let text = ''
  try { for (const node of JSON.parse(content).content ?? []) text += nodeText(node) } catch { text = content }
  // 中文字符 + 英文单词
  const cn = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const en = (text.match(/[A-Za-z]+/g) ?? []).length
  return cn + en
}
function nodeText(node: any): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map((c: any) => nodeText(c)).join('')
}
