import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type AiGenerateRequest } from '../shared/ipc'

const api = {
  project: {
    list: () => ipcRenderer.invoke(IPC.PROJECT_LIST),
    create: (i: any) => ipcRenderer.invoke(IPC.PROJECT_CREATE, i),
    update: (id: string, patch: any) => ipcRenderer.invoke(IPC.PROJECT_UPDATE, id, patch),
    del: (id: string) => ipcRenderer.invoke(IPC.PROJECT_DELETE, id)
  },
  volume: {
    list: (pid: string) => ipcRenderer.invoke(IPC.VOLUME_LIST, pid),
    create: (i: any) => ipcRenderer.invoke(IPC.VOLUME_CREATE, i),
    update: (id: string, patch: any) => ipcRenderer.invoke(IPC.VOLUME_UPDATE, id, patch),
    reorder: (ids: string[]) => ipcRenderer.invoke(IPC.VOLUME_REORDER, ids),
    del: (id: string) => ipcRenderer.invoke(IPC.VOLUME_DELETE, id)
  },
  chapter: {
    get: (id: string) => ipcRenderer.invoke(IPC.CHAPTER_GET, id),
    save: (id: string, content: string) => ipcRenderer.invoke(IPC.CHAPTER_SAVE, id, content),
    create: (i: any) => ipcRenderer.invoke(IPC.CHAPTER_CREATE, i),
    reorder: (ids: string[]) => ipcRenderer.invoke(IPC.CHAPTER_REORDER, ids),
    del: (id: string) => ipcRenderer.invoke(IPC.CHAPTER_DELETE, id),
    update: (id: string, patch: any) => ipcRenderer.invoke(IPC.CHAPTER_UPDATE, id, patch),
    listByVolume: (vid: string) => ipcRenderer.invoke(IPC.CHAPTER_LIST_BY_VOLUME, vid)
  },
  character: {
    list: (pid: string) => ipcRenderer.invoke(IPC.CHARACTER_LIST, pid),
    save: (i: any) => ipcRenderer.invoke(IPC.CHARACTER_SAVE, i),
    del: (id: string) => ipcRenderer.invoke(IPC.CHARACTER_DELETE, id)
  },
  setting: {
    list: (pid: string) => ipcRenderer.invoke(IPC.SETTING_LIST, pid),
    save: (i: any) => ipcRenderer.invoke(IPC.SETTING_SAVE, i),
    del: (id: string) => ipcRenderer.invoke(IPC.SETTING_DELETE, id)
  },
  aiConfig: {
    get: () => ipcRenderer.invoke(IPC.AI_CONFIG_GET),
    save: (cfg: any) => ipcRenderer.invoke(IPC.AI_CONFIG_SAVE, cfg)
  },
  ai: {
    generate: (req: AiGenerateRequest) => ipcRenderer.invoke(IPC.AI_GENERATE, req),
    onCancel: (requestId: string) => ipcRenderer.send(IPC.AI_GENERATE_CANCEL, requestId),
    onChunk: (cb: (e: any) => void) => { const h = (_: any, e: any) => cb(e); ipcRenderer.on(IPC.AI_GENERATE_CHUNK, h); return () => ipcRenderer.removeListener(IPC.AI_GENERATE_CHUNK, h) },
    onDone: (cb: (e: any) => void) => { const h = (_: any, e: any) => cb(e); ipcRenderer.on(IPC.AI_GENERATE_DONE, h); return () => ipcRenderer.removeListener(IPC.AI_GENERATE_DONE, h) },
    onError: (cb: (e: any) => void) => { const h = (_: any, e: any) => cb(e); ipcRenderer.on(IPC.AI_GENERATE_ERROR, h); return () => ipcRenderer.removeListener(IPC.AI_GENERATE_ERROR, h) }
  }
}
contextBridge.exposeInMainWorld('api', api)
