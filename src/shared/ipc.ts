import type { Project, Volume, Chapter, Character, Setting, AiConfig, GenTask } from './types'

export const IPC = {
  // data
  PROJECT_LIST: 'project:list', PROJECT_CREATE: 'project:create', PROJECT_UPDATE: 'project:update', PROJECT_DELETE: 'project:delete',
  VOLUME_LIST: 'volume:list', VOLUME_CREATE: 'volume:create', VOLUME_UPDATE: 'volume:update', VOLUME_REORDER: 'volume:reorder', VOLUME_DELETE: 'volume:delete',
  CHAPTER_GET: 'chapter:get', CHAPTER_SAVE: 'chapter:save', CHAPTER_CREATE: 'chapter:create', CHAPTER_REORDER: 'chapter:reorder', CHAPTER_DELETE: 'chapter:delete', CHAPTER_UPDATE: 'chapter:update', CHAPTER_LIST_BY_VOLUME: 'chapter:listByVolume',
  CHARACTER_LIST: 'character:list', CHARACTER_SAVE: 'character:save', CHARACTER_DELETE: 'character:delete',
  SETTING_LIST: 'setting:list', SETTING_SAVE: 'setting:save', SETTING_DELETE: 'setting:delete',
  AI_CONFIG_GET: 'ai:config:get', AI_CONFIG_SAVE: 'ai:config:save',
  // ai streaming
  AI_GENERATE: 'ai:generate', AI_GENERATE_CHUNK: 'ai:generate:chunk', AI_GENERATE_DONE: 'ai:generate:done', AI_GENERATE_ERROR: 'ai:generate:error', AI_GENERATE_CANCEL: 'ai:generate:cancel'
} as const

export interface AiGenerateRequest {
  requestId: string
  task: GenTask
  chapterId: string
  instruction: string
  mode?: 'polish' | 'expand' | 'shrink' | 'restyle' // 改写模式
}

export interface Api {
  project: { list(): Promise<Project[]>; create(input: Partial<Project>): Promise<Project>; update(id: string, patch: Partial<Project>): Promise<void>; del(id: string): Promise<void> }
  volume: { list(projectId: string): Promise<Volume[]>; create(input: Partial<Volume>): Promise<Volume>; update(id: string, patch: Partial<Volume>): Promise<void>; reorder(ids: string[]): Promise<void>; del(id: string): Promise<void> }
  chapter: { get(id: string): Promise<Chapter>; save(id: string, content: string): Promise<{ word_count: number }>; create(input: Partial<Chapter>): Promise<Chapter>; reorder(ids: string[]): Promise<void>; del(id: string): Promise<void>; update(id: string, patch: Partial<Chapter>): Promise<void>; listByVolume(volumeId: string): Promise<Chapter[]> }
  character: { list(projectId: string): Promise<Character[]>; save(input: Partial<Character>): Promise<Character>; del(id: string): Promise<void> }
  setting: { list(projectId: string): Promise<Setting[]>; save(input: Partial<Setting>): Promise<Setting>; del(id: string): Promise<void> }
  aiConfig: { get(): Promise<AiConfig>; save(cfg: AiConfig): Promise<void> }
  ai: {
    generate(req: AiGenerateRequest): Promise<void>
    onCancel(requestId: string): void
    onChunk(cb: (e: { requestId: string; chunk: string }) => void): () => void
    onDone(cb: (e: { requestId: string }) => void): () => void
    onError(cb: (e: { requestId: string; message: string }) => void): () => void
  }
}

declare global { interface Window { api: Api } }
