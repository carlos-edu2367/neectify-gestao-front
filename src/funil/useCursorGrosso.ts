import { useSyncExternalStore } from 'react'

const QUERY = '(pointer: coarse)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** true em dispositivos de toque (ponteiro grosso): ali nao se arrasta, usa-se o menu. */
export function useCursorGrosso(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
