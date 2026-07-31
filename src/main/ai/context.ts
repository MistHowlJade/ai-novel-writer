import type { Character, Setting } from '../../shared/types'
import type { GenerateContext } from './provider'

const TAIL_LIMIT = 2000

/** 按正文提及的人物名筛选相关人物卡(MVP:简单姓名匹配,不做 NER) */
export function filterRelevantCharacters(text: string, chars: Character[]): Character[] {
  return chars.filter(c => c.name && text.includes(c.name))
}

export function assembleContinueContext(chapterText: string, instruction: string, allChars: Character[], allSettings: Setting[]): GenerateContext {
  const tail = chapterText.length > TAIL_LIMIT ? chapterText.slice(-TAIL_LIMIT) : chapterText
  const chars = filterRelevantCharacters(chapterText, allChars)
  return { task: 'continue', sourceText: tail, instruction, characters: chars, settings: allSettings }
}

export function assembleRewriteContext(selected: string, mode: 'polish' | 'expand' | 'shrink' | 'restyle', _instruction?: string): GenerateContext {
  const map = { polish: '润色,提升表达', expand: '扩写,增加细节', shrink: '缩写,精简', restyle: '换一种风格改写' }
  return { task: 'rewrite', sourceText: selected, instruction: map[mode], characters: [], settings: [] }
}
