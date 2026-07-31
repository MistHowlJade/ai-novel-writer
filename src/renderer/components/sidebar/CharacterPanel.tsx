import { useEffect, useState } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import type { Character } from '../../../shared/types'

export function CharacterPanel() {
  const pid = useProjectStore(s => s.currentProjectId)
  const [list, setList] = useState<Character[]>([])
  const [editing, setEditing] = useState<Partial<Character> | null>(null)

  async function load() {
    if (pid) setList(await window.api.character.list(pid))
    else setList([])
  }
  useEffect(() => { load() }, [pid])

  async function save() {
    if (!editing || !pid) return
    await window.api.character.save({ ...editing, project_id: pid })
    setEditing(null)
    load()
  }

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <span className="font-medium text-sm">人物库</span>
        <button
          onClick={() => setEditing({ name: '', role: '' })}
          disabled={!pid}
          className="text-xs text-indigo-600 disabled:text-gray-300"
        >
          +角色
        </button>
      </div>

      {list.map(c => (
        <button
          key={c.id}
          onClick={() => setEditing(c)}
          className="block w-full text-left py-1 text-sm hover:bg-gray-100 rounded px-1"
        >
          <span className="truncate">{c.name}</span>{' '}
          <span className="text-xs text-gray-400">{c.role}</span>
        </button>
      ))}

      {editing && (
        <div className="mt-2 space-y-1 border-t pt-2">
          <input
            className="w-full border rounded p-1 text-sm"
            placeholder="姓名"
            value={editing.name ?? ''}
            onChange={e => setEditing({ ...editing, name: e.target.value })}
          />
          <input
            className="w-full border rounded p-1 text-sm"
            placeholder="角色(主角/配角/反派)"
            value={editing.role ?? ''}
            onChange={e => setEditing({ ...editing, role: e.target.value })}
          />
          <textarea
            className="w-full border rounded p-1 text-sm"
            placeholder="外貌"
            value={editing.appearance ?? ''}
            onChange={e => setEditing({ ...editing, appearance: e.target.value })}
          />
          <textarea
            className="w-full border rounded p-1 text-sm"
            placeholder="性格"
            value={editing.personality ?? ''}
            onChange={e => setEditing({ ...editing, personality: e.target.value })}
          />
          <textarea
            className="w-full border rounded p-1 text-sm"
            placeholder="背景"
            value={editing.background ?? ''}
            onChange={e => setEditing({ ...editing, background: e.target.value })}
          />
          <textarea
            className="w-full border rounded p-1 text-sm"
            placeholder="关系"
            value={editing.relations ?? ''}
            onChange={e => setEditing({ ...editing, relations: e.target.value })}
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              className="rounded bg-indigo-600 px-3 py-0.5 text-xs text-white"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded border px-3 py-0.5 text-xs"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
