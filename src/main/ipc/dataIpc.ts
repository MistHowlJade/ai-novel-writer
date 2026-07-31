import { ipcMain } from 'electron'
import { IPC } from '../../shared/ipc'
import * as P from '../db/dao/projects'
import * as V from '../db/dao/volumes'
import * as C from '../db/dao/chapters'
import * as CH from '../db/dao/characters'
import * as S from '../db/dao/settings'
import * as A from '../db/dao/aiConfig'

export function registerDataIpc(): void {
  ipcMain.handle(IPC.PROJECT_LIST, () => P.listProjects())
  ipcMain.handle(IPC.PROJECT_CREATE, (_e, i) => P.createProject(i))
  ipcMain.handle(IPC.PROJECT_UPDATE, (_e, id, patch) => P.updateProject(id, patch))
  ipcMain.handle(IPC.PROJECT_DELETE, (_e, id) => P.deleteProject(id))

  ipcMain.handle(IPC.VOLUME_LIST, (_e, pid) => V.listVolumes(pid))
  ipcMain.handle(IPC.VOLUME_CREATE, (_e, i) => V.createVolume(i))
  ipcMain.handle(IPC.VOLUME_UPDATE, (_e, id, patch) => V.updateVolume(id, patch))
  ipcMain.handle(IPC.VOLUME_REORDER, (_e, ids) => V.reorderVolumes(ids))
  ipcMain.handle(IPC.VOLUME_DELETE, (_e, id) => V.deleteVolume(id))

  ipcMain.handle(IPC.CHAPTER_GET, (_e, id) => C.getChapter(id))
  ipcMain.handle(IPC.CHAPTER_SAVE, (_e, id, content) => C.saveChapter(id, content))
  ipcMain.handle(IPC.CHAPTER_CREATE, (_e, i) => C.createChapter(i))
  ipcMain.handle(IPC.CHAPTER_REORDER, (_e, ids) => C.reorderChapters(ids))
  ipcMain.handle(IPC.CHAPTER_DELETE, (_e, id) => C.deleteChapter(id))
  ipcMain.handle(IPC.CHAPTER_UPDATE, (_e, id, patch) => C.updateChapter(id, patch))
  ipcMain.handle(IPC.CHAPTER_LIST_BY_VOLUME, (_e, vid) => C.listByVolume(vid))

  ipcMain.handle(IPC.CHARACTER_LIST, (_e, pid) => CH.listCharacters(pid))
  ipcMain.handle(IPC.CHARACTER_SAVE, (_e, i) => CH.saveCharacter(i))
  ipcMain.handle(IPC.CHARACTER_DELETE, (_e, id) => CH.deleteCharacter(id))

  ipcMain.handle(IPC.SETTING_LIST, (_e, pid) => S.listSettings(pid))
  ipcMain.handle(IPC.SETTING_SAVE, (_e, i) => S.saveSetting(i))
  ipcMain.handle(IPC.SETTING_DELETE, (_e, id) => S.deleteSetting(id))

  ipcMain.handle(IPC.AI_CONFIG_GET, () => A.getAiConfig())
  ipcMain.handle(IPC.AI_CONFIG_SAVE, (_e, cfg) => A.saveAiConfig(cfg))
}
