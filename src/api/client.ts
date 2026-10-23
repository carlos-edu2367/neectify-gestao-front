export class ApiError extends Error {
  status: number
  detail: string
  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

const BASE: string = import.meta.env.VITE_API_URL ?? ''
const MOCK = import.meta.env.DEV && import.meta.env.VITE_API_MOCK === '1'

if (!BASE && !MOCK) {
  throw new Error('VITE_API_URL nao definida: configure a URL da API (ex.: https://api.neectify.com).')
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Neectify-Client': 'painel',
        ...(init.headers as Record<string, string> | undefined),
      },
    })
  } catch {
    throw new ApiError(0, 'erro_de_rede')
  }
  if (!res.ok) {
    let detail = 'erro_desconhecido'
    try {
      const body = (await res.json()) as { detail?: unknown }
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      /* corpo que nao e JSON */
    }
    throw new ApiError(res.status, detail)
  }
  if (res.status === 204) return undefined as T
  try {
    return (await res.json()) as T
  } catch {
    throw new ApiError(0, 'resposta_invalida')
  }
}
