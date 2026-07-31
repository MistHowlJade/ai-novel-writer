import { useEffect } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import { ProjectTree } from '../projectTree/ProjectTree'
import { Editor } from '../editor/Editor'
import { AiPanel } from '../sidebar/AiPanel'

export function AppShell() {
  const projects = useProjectStore(s => s.projects)
  const loadProjects = useProjectStore(s => s.loadProjects)
  const wordCount = useEditorStore(s => s.wordCount)
  const saving = useEditorStore(s => s.saving)
  useEffect(() => { loadProjects() }, [loadProjects])
  return (
    <div className="flex h-screen">
      <aside className="w-60 border-r bg-gray-50 p-3 overflow-auto"><ProjectTree /></aside>
      <main className="flex-1 flex flex-col">
        <Editor />
        <footer className="border-t px-4 py-1 text-xs text-gray-500">
          {saving ? '保存中...' : `已保存 ${wordCount} 字`}
        </footer>
      </main>
      <aside className="w-72 border-l bg-gray-50 p-3"><AiPanel /></aside>
    </div>
  )
}
