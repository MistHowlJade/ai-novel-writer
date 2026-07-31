import { getDb } from '../index'
import type { AiConfig } from '../../../shared/types'

export function getAiConfig(): AiConfig {
  return getDb().prepare('SELECT * FROM ai_config WHERE id=1').get() as AiConfig
}
export function saveAiConfig(cfg: AiConfig): void {
  getDb().prepare('UPDATE ai_config SET provider=?,model=?,api_key=?,base_url=? WHERE id=1').run(cfg.provider, cfg.model, cfg.api_key, cfg.base_url)
}
