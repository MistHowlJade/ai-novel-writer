import { useEffect, useState } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useEditorStore } from '../../stores/editorStore'
import { ProjectTree } from '../projectTree/ProjectTree'
import { Editor } from '../editor/Editor'
import { AiPanel } from '../sidebar/AiPanel'
import { CharacterPanel } from '../sidebar/CharacterPanel'
import { AiSettingsPage } from '../settings/AiSettingsPage'

type Tab = 'ai' | 'chars'

export function AppShell() {
  const projects = useProjectStore(s => s.projects)
  const loadProjects = useProjectStore(s => s.loadProjects)
  const wordCount = useEditorStore(s => s.wordCount)
  const saving = useEditorStore(s => s.saving)
  const [tab, setTab] = useState<Tab>('ai')
  const [showSettings, setShowSettings] = useState(false)
  useEffect(() => { loadProjects() }, [loadProjects])

  return (
    <div className="flex h-screen">
      <aside className="w-60 border-r bg-gray-50 p-3 overflow-auto"><ProjectTree /></aside>
      <main className="flex-1 flex flex-col">
        <div className="flex items-center border-b px-3 py-1">
          <button
            onClick={() => setShowSettings(true)}
            className="ml-auto text-gray-500 hover:text-gray-700 text-sm"
            title="AI 配置"
          >
            ⚙
          </button>
        </div>
        {showSettings ? (
          <div className="flex-1 overflow-auto">
            <button
              onClick={() => setShowSettings(false)}
              className="m-3 text-sm text-indigo-600"
            >
              ← 返回
            </button>
            <AiSettingsPage />
          </div>
        ) : (
          <>
            <Editor />
            <footer className="border-t px-4 py-1 text-xs text-gray-500">
              {saving ? '保存中...' : `已保存 ${wordCount} 字`}
            </footer>
          </>
        )}
      </main>
      <aside className="w-72 border-l bg-gray-50 p-3">
        <div className="mb-2 flex gap-1 border-b">
          {(['ai', 'chars'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-sm ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            >
              {t === 'ai' ? 'AI 助手' : '人物库'}
            </button>
          ))}
        </div>
        {tab === 'ai' ? <AiPanel /> : <CharacterPanel />}
      </aside>
    </div>
  )
}
