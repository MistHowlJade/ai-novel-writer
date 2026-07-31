import { v4 as uuid } from 'uuid'
import { getDb } from '../index'
import type { Character } from '../../../shared/types'

export function listCharacters(projectId: string): Character[] {
  return getDb().prepare('SELECT * FROM characters WHERE project_id=? ORDER BY name').all(projectId) as Character[]
}
export function saveCharacter(input: Partial<Character>): Character {
  if (input.id && getDb().prepare('SELECT 1 FROM characters WHERE id=?').get(input.id)) {
    const cur = getDb().prepare('SELECT * FROM characters WHERE id=?').get(input.id) as Character
    const next = { ...cur, ...input, id: input.id }
    getDb().prepare('UPDATE characters SET name=@name,role=@role,appearance=@appearance,personality=@personality,background=@background,relations=@relations WHERE id=@id').run(next)
    return next
  }
  const c: Character = {
    id: uuid(), project_id: input.project_id!, name: input.name ?? '新角色', role: input.role ?? '',
    appearance: input.appearance ?? '', personality: input.personality ?? '',
    background: input.background ?? '', relations: input.relations ?? ''
  }
  getDb().prepare('INSERT INTO characters VALUES (@id,@project_id,@name,@role,@appearance,@personality,@background,@relations)').run(c)
  return c
}
export function deleteCharacter(id: string): void {
  getDb().prepare('DELETE FROM characters WHERE id=?').run(id)
}
