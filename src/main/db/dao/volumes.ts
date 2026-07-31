import { v4 as uuid } from 'uuid'
import { getDb } from '../index'
import type { Volume } from '../../../shared/types'

export function listVolumes(projectId: string): Volume[] {
  return getDb().prepare('SELECT * FROM volumes WHERE project_id=? ORDER BY sort_order').all(projectId) as Volume[]
}
export function createVolume(input: Partial<Volume>): Volume {
  const order = (getDb().prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS n FROM volumes WHERE project_id=?').get(input.project_id) as { n: number }).n
  const v: Volume = { id: uuid(), project_id: input.project_id!, title: input.title ?? '新卷', sort_order: order }
  getDb().prepare('INSERT INTO volumes VALUES (@id,@project_id,@title,@sort_order)').run(v)
  return v
}
export function updateVolume(id: string, patch: Partial<Volume>): void {
  if (patch.title !== undefined) getDb().prepare('UPDATE volumes SET title=? WHERE id=?').run(patch.title, id)
}
export function reorderVolumes(ids: string[]): void {
  const stmt = getDb().prepare('UPDATE volumes SET sort_order=? WHERE id=?')
  ids.forEach((id, i) => stmt.run(i, id))
}
export function deleteVolume(id: string): void {
  getDb().prepare('DELETE FROM volumes WHERE id=?').run(id)
}
