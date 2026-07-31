import { create } from 'zustand'
import type { Project, Volume, Chapter } from '../../shared/types'

interface ProjectState {
  projects: Project[]
  currentProjectId: string | null
  volumes: Volume[]
  currentVolumeId: string | null
  chapters: Chapter[]
  loadProjects: () => Promise<void>
  selectProject: (id: string) => Promise<void>
  refreshVolumes: () => Promise<void>
}
export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [], currentProjectId: null, volumes: [], currentVolumeId: null, chapters: [],
  loadProjects: async () => set({ projects: await window.api.project.list() }),
  selectProject: async (id) => {
    set({ currentProjectId: id, volumes: await window.api.volume.list(id) })
    get().refreshVolumes()
  },
  refreshVolumes: async () => {
    const pid = get().currentProjectId
    if (pid) set({ volumes: await window.api.volume.list(pid) })
  }
}))
