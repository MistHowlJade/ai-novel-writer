import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Database } from 'better-sqlite3'
import { initDb, closeDb, getDb } from '../../../src/main/db'

describe('initDb', () => {
  afterEach(() => closeDb())

  it('建表并允许重复调用幂等', () => {
    initDb(':memory:')
    initDb(':memory:') // 不抛错
    const db = getDb()
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]
    const names = tables.map(t => t.name)
    expect(names).toContain('projects')
    expect(names).toContain('volumes')
    expect(names).toContain('chapters')
    expect(names).toContain('characters')
    expect(names).toContain('settings')
    expect(names).toContain('ai_config')
  })
})
