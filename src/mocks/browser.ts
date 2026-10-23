import { setupWorker } from 'msw/browser'
import { db, resetDb } from './db'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/** Ganchos para testes E2E (page.evaluate). Existe so quando o mock esta ativo. */
declare global {
  interface Window {
    __neectifyMock?: {
      expireSession: () => void
      failNextLeadPatch: (status?: number) => void
      reset: () => void
    }
  }
}

export async function startMocks() {
  window.__neectifyMock = {
    expireSession: () => {
      db.sessionExpired = true
    },
    failNextLeadPatch: (status = 500) => {
      db.failNextLeadPatch = status
    },
    reset: resetDb,
  }
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}
