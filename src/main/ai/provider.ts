import type { Character, Setting, GenTask } from '../../shared/types'

export interface GenerateContext {
  task: GenTask
  sourceText: string      // 续写:章末文本;改写:选中文本
  instruction: string
  characters: Character[]
  settings: Setting[]
}

export interface AiProvider {
  generate(ctx: GenerateContext, opts: { maxTokens?: number; temperature?: number; signal?: AbortSignal }): AsyncIterable<string>
}
