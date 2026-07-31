import { useEffect, useState } from 'react'
import type { AiConfig } from '../../../shared/types'

export function AiSettingsPage() {
  const [cfg, setCfg] = useState<AiConfig>({ provider: 'cloud', model: 'deepseek-chat', api_key: '', base_url: '' })
  const [saved, setSaved] = useState(false)
  useEffect(() => { window.api.aiConfig.get().then(setCfg) }, [])
  async function save() {
    await window.api.aiConfig.save(cfg)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }
  return (
    <div className="mx-auto max-w-md p-6">
      <h2 className="mb-4 text-lg font-medium">AI 配置</h2>
      <label className="block text-sm">
        Base URL
        <input
          className="mt-1 w-full border rounded p-1.5"
          value={cfg.base_url}
          onChange={e => setCfg({ ...cfg, base_url: e.target.value })}
          placeholder="https://api.deepseek.com/v1"
        />
      </label>
      <label className="mt-3 block text-sm">
        模型
        <input
          className="mt-1 w-full border rounded p-1.5"
          value={cfg.model}
          onChange={e => setCfg({ ...cfg, model: e.target.value })}
        />
      </label>
      <label className="mt-3 block text-sm">
        API Key
        <input
          type="password"
          className="mt-1 w-full border rounded p-1.5"
          value={cfg.api_key}
          onChange={e => setCfg({ ...cfg, api_key: e.target.value })}
        />
      </label>
      <button
        onClick={save}
        className="mt-4 rounded bg-indigo-600 px-4 py-1.5 text-sm text-white"
      >
        保存
      </button>
      {saved && <span className="ml-3 text-xs text-green-600">已保存</span>}
    </div>
  )
}
