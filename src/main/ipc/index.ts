import { registerDataIpc } from './dataIpc'
import { registerAiIpc } from './aiIpc'

export function registerIpc(): void {
  registerDataIpc()
  registerAiIpc()
}
