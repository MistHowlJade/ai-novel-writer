export interface Project {
  id: string; title: string; synopsis: string; genre: string
  target_words: number; created_at: string; updated_at: string
}
export interface Volume {
  id: string; project_id: string; title: string; sort_order: number
}
export interface Chapter {
  id: string; volume_id: string; title: string; content: string
  word_count: number; sort_order: number; status: 'draft' | 'done'; updated_at: string
}
export interface Character {
  id: string; project_id: string; name: string; role: string
  appearance: string; personality: string; background: string; relations: string
}
export interface Setting {
  id: string; project_id: string; category: string; name: string; description: string
}
export interface AiConfig {
  provider: 'cloud' | 'local'; model: string; api_key: string; base_url: string
}
export type GenTask = 'continue' | 'rewrite'
export interface GenOpts { maxTokens?: number; temperature?: number; signal?: AbortSignal }
