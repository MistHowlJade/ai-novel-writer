import { useEffect } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { ProjectTree } from '../projectTree/ProjectTree'

export function AppShell() {
  const projects = useProjectStore(s => s.projects)
  const loadProjects = useProjectStore(s => s.loadProjects)
  useEffect(() => { loadProjects() }, [loadProjects])
  return (
    <div className="flex h-screen">
      <aside className="w-60 border-r bg-gray-50 p-3 overflow-auto"><ProjectTree /></aside>
      <main className="flex-1 flex flex-col">{/* 编辑器 Task 11 */}</main>
      <aside className="w-72 border-l bg-gray-50 p-3">{/* 侧边栏 Task 12 */}</aside>
    </div>
  )
}
