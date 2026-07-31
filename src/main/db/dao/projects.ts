import { v4 as uuid } from 'uuid'
import { getDb } from '../index'
import type { Project } from '../../../shared/types'

const now = () => new Date().toISOString()

export function listProjects(): Project[] {
  return getDb().prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Project[]
}
export function createProject(input: Partial<Project>): Project {
  const p: Project = {
    id: uuid(), title: input.title ?? '未命名项目', synopsis: input.synopsis ?? '',
    genre: input.genre ?? '', target_words: input.target_words ?? 0,
    created_at: now(), updated_at: now()
  }
  getDb().prepare('INSERT INTO projects VALUES (@id,@title,@synopsis,@genre,@target_words,@created_at,@updated_at)').run(p)
  return p
}
export function updateProject(id: string, patch: Partial<Project>): void {
  const cur = getDb().prepare('SELECT * FROM projects WHERE id=?').get(id) as Project
  const next = { ...cur, ...patch, id, updated_at: now() }
  getDb().prepare('UPDATE projects SET title=@title,synopsis=@synopsis,genre=@genre,target_words=@target_words,updated_at=@updated_at WHERE id=@id').run(next)
}
export function deleteProject(id: string): void {
  getDb().prepare('DELETE FROM projects WHERE id=?').run(id)
}
