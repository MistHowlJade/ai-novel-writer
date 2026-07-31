import { useEffect, useState } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import type { Chapter } from '../../../shared/types'

export function ProjectTree() {
  const projects = useProjectStore(s => s.projects)
  const volumes = useProjectStore(s => s.volumes)
  const currentProjectId = useProjectStore(s => s.currentProjectId)
  const selectProject = useProjectStore(s => s.selectProject)
  const refreshVolumes = useProjectStore(s => s.refreshVolumes)

  const setChapter = useEditorStore(s => s.setChapter)
  const currentChapterId = useEditorStore(s => s.currentChapterId)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])

  async function loadChapters(volumeId: string) {
    setChapters(await window.api.chapter.listByVolume(volumeId))
  }

  // volumes 变化时自动加载第一个卷的章节
  useEffect(() => {
    if (volumes.length > 0) {
      const first = volumes[0]
      setExpandedId(first.id)
      loadChapters(first.id)
    } else {
      setExpandedId(null)
      setChapters([])
    }
  }, [volumes])

  function toggleVolume(volumeId: string) {
    if (expandedId === volumeId) {
      setExpandedId(null)
      return
    }
    setExpandedId(volumeId)
    loadChapters(volumeId)
  }

  async function addVolume() {
    if (!currentProjectId) return
    await window.api.volume.create({ project_id: currentProjectId, title: '新卷' })
    refreshVolumes()
  }

  async function addChapter(volumeId: string) {
    await window.api.chapter.create({ volume_id: volumeId, title: '新章' })
    setExpandedId(volumeId)
    await loadChapters(volumeId)
  }

  return (
    <div>
      <select
        className="w-full mb-2 border rounded px-1 py-1 text-sm"
        value={currentProjectId ?? ''}
        onChange={e => { if (e.target.value) selectProject(e.target.value) }}
      >
        {projects.length === 0 && <option value="">暂无项目</option>}
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.title}</option>
        ))}
      </select>

      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-sm">项目树</span>
        <button
          onClick={addVolume}
          disabled={!currentProjectId}
          className="text-xs text-indigo-600 disabled:text-gray-300"
        >
          +卷
        </button>
      </div>

      {volumes.map(v => (
        <div key={v.id} className="mb-1">
          <div className="flex justify-between items-center px-1 py-0.5 hover:bg-gray-100 rounded">
            <button
              onClick={() => toggleVolume(v.id)}
              className="flex-1 text-left text-sm flex items-center gap-1"
            >
              <span className="text-gray-400 text-xs w-3">
                {expandedId === v.id ? '▼' : '▶'}
              </span>
              <span className="truncate">{v.title}</span>
            </button>
            <button
              onClick={e => { e.stopPropagation(); addChapter(v.id) }}
              className="text-xs text-indigo-600"
            >
              +章
            </button>
          </div>
          {expandedId === v.id && chapters.map(c => (
            <button
              key={c.id}
              onClick={() => setChapter(c.id)}
              className={`block w-full text-left pl-7 py-1 text-sm hover:bg-gray-100 ${currentChapterId === c.id ? 'bg-indigo-50 text-indigo-700' : ''}`}
            >
              <span className="truncate block">{c.title}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
