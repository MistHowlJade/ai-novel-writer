import { ipcMain, BrowserWindow } from 'electron'
import { IPC, type AiGenerateRequest } from '../../shared/ipc'
import { buildContext, buildRewriteContext, runGenerate, cancelGenerate } from '../services/aiService'

export function registerAiIpc(): void {
  ipcMain.handle(IPC.AI_GENERATE, async (e, req: AiGenerateRequest) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const ctx = req.task === 'rewrite' && req.instruction
      ? buildRewriteContext(req.instruction /* 选中正文 */, req.mode ?? 'polish')
      : buildContext(req)
    try {
      await runGenerate(req, ctx, (chunk) => win?.webContents.send(IPC.AI_GENERATE_CHUNK, { requestId: req.requestId, chunk }))
      win?.webContents.send(IPC.AI_GENERATE_DONE, { requestId: req.requestId })
    } catch (err: any) {
      win?.webContents.send(IPC.AI_GENERATE_ERROR, { requestId: req.requestId, message: err?.message ?? '生成失败' })
    }
  })
  ipcMain.on(IPC.AI_GENERATE_CANCEL, (_e, requestId: string) => cancelGenerate(requestId))
}
