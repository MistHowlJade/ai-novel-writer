import { v4 as uuid } from 'uuid'
import { getDb } from '../index'
import type { Setting } from '../../../shared/types'

export function listSettings(projectId: string): Setting[] {
  return getDb().prepare('SELECT * FROM settings WHERE project_id=? ORDER BY category,name').all(projectId) as Setting[]
}
export function saveSetting(input: Partial<Setting>): Setting {
  if (input.id && getDb().prepare('SELECT 1 FROM settings WHERE id=?').get(input.id)) {
    const cur = getDb().prepare('SELECT * FROM settings WHERE id=?').get(input.id) as Setting
    const next = { ...cur, ...input, id: input.id }
    getDb().prepare('UPDATE settings SET category=@category,name=@name,description=@description WHERE id=@id').run(next)
    return next
  }
  const s: Setting = { id: uuid(), project_id: input.project_id!, category: input.category ?? '地点', name: input.name ?? '', description: input.description ?? '' }
  getDb().prepare('INSERT INTO settings VALUES (@id,@project_id,@category,@name,@description)').run(s)
  return s
}
export function deleteSetting(id: string): void {
  getDb().prepare('DELETE FROM settings WHERE id=?').run(id)
}
