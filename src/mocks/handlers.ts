import { http, HttpResponse } from 'msw'
import type {
  Canal,
  Categoria,
  FormaPagamento,
  LeadOut,
  LeadStatus,
  ProjetoOut,
  ProjetoStatus,
  Stats,
} from '../api/types'
import { db, MOCK_PASSWORD, MOCK_USER, nextId } from './db'

const COOKIE = 'neectify_session'
// Fallback para ambientes sem document (Node/Vitest).
let memorySession = false

const hasSession = () =>
  typeof document !== 'undefined' ? document.cookie.includes(`${COOKIE}=`) : memorySession

function setSession(on: boolean) {
  memorySession = on
  if (typeof document !== 'undefined') {
    document.cookie = on
      ? `${COOKIE}=mock; Path=/; Max-Age=43200; SameSite=Lax`
      : `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}

const err = (status: number, detail: string) => HttpResponse.json({ detail }, { status })

/** Retorna uma Response de erro quando a requisicao nao pode seguir; null caso contrario. */
function guard(request: Request) {
  if (db.sessionExpired || !hasSession()) return err(401, 'nao_autenticado')
  if (request.headers.get('X-Neectify-Client') !== 'painel') return err(403, 'cliente_invalido')
  return null
}

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const LEAD_STATUSES: LeadStatus[] = ['novo', 'conversando', 'proposta', 'fechado', 'perdido']
const PROJETO_STATUSES: ProjetoStatus[] = ['planejamento', 'andamento', 'revisao', 'entregue', 'pausado']
const FORMAS: FormaPagamento[] = ['PIX', 'CREDITO', 'DEBITO', 'BOLETO']

function detalhe(lead: LeadOut) {
  const notas = [...(db.notas[lead.id] ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const projeto = db.projetos.find((p) => p.lead_id === lead.id) ?? null
  return { ...lead, notas, projeto }
}

/** Valor decimal valido ("4500", "4500.5") normalizado para duas casas; null se invalido. */
function normalizaValor(v: unknown): string | null {
  const s = typeof v === 'number' ? String(v) : typeof v === 'string' ? v.trim() : ''
  if (!/^\d+(\.\d+)?$/.test(s)) return null
  return Number(s).toFixed(2)
}

const SP_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Segunda-feira (YYYY-MM-DD) da semana da data, no fuso America/Sao_Paulo. */
function segundaDe(d: Date): string {
  const local = SP_DATE.format(d) // YYYY-MM-DD
  const base = new Date(`${local}T00:00:00Z`)
  const dow = (base.getUTCDay() + 6) % 7 // seg=0
  base.setUTCDate(base.getUTCDate() - dow)
  return base.toISOString().slice(0, 10)
}

function calcStats(dias: number): Stats {
  const agora = new Date()
  const inicio = new Date(agora.getTime() - dias * 86_400_000)

  const semanas: Record<string, number> = {}
  const cursor = new Date(`${segundaDe(inicio)}T00:00:00Z`)
  const ultima = segundaDe(agora)
  for (let guardCount = 0; guardCount < 80; guardCount++) {
    const k = cursor.toISOString().slice(0, 10)
    semanas[k] = 0
    if (k >= ultima) break
    cursor.setUTCDate(cursor.getUTCDate() + 7)
  }

  const porCategoria: Record<Categoria, number> = { site: 0, automacao: 0, ia: 0, sistema: 0, conversar: 0 }
  const porCanal: Record<Canal, number> = { google: 0, meta: 0, indicacao: 0, direto: 0, outro: 0 }

  for (const l of db.leads) {
    const criado = new Date(l.created_at)
    if (criado < inicio) continue
    const k = segundaDe(criado)
    if (k in semanas) semanas[k] += 1
    porCategoria[l.categoria] += 1
    porCanal[l.canal] += 1
  }

  const fechados = db.leads.filter((l) => l.status === 'fechado').length
  const perdidos = db.leads.filter((l) => l.status === 'perdido').length
  const limite = agora.getTime() - 2 * 86_400_000
  const parados = db.leads.filter(
    (l) => l.status === 'novo' && new Date(l.status_atualizado_em).getTime() < limite,
  ).length

  return {
    leads_por_semana: Object.entries(semanas).map(([semana, total]) => ({ semana, total })),
    por_categoria: porCategoria,
    por_canal: porCanal,
    taxa_fechamento: fechados + perdidos === 0 ? 0 : fechados / (fechados + perdidos),
    parados,
  }
}

function derivaCanal(utmSource: string | null, referrer: string | null): Canal {
  const s = (utmSource ?? '').toLowerCase()
  const r = (referrer ?? '').toLowerCase()
  if (s.includes('google') || r.includes('google.')) return 'google'
  if (['facebook', 'instagram', 'meta', 'fb', 'ig'].some((x) => s.includes(x)) || /facebook|instagram/.test(r))
    return 'meta'
  if (s.includes('indica')) return 'indicacao'
  if (!s && !r) return 'direto'
  return 'outro'
}

export const handlers = [
  // ---- Publico ----
  http.get('*/v1/health', () => HttpResponse.json({ status: 'ok' })),

  http.post('*/v1/leads', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    if (body.website) return HttpResponse.json({ id: nextId() }, { status: 201 })
    const str = (k: string): string | null => (typeof body[k] === 'string' && body[k] ? (body[k] as string) : null)
    const agora = new Date().toISOString()
    const lead: LeadOut = {
      id: nextId(),
      nome: String(body.nome ?? ''),
      empresa: str('empresa'),
      email: String(body.email ?? ''),
      whatsapp: String(body.whatsapp ?? ''),
      categoria: body.categoria as Categoria,
      segmento: String(body.segmento ?? ''),
      porte: body.porte as LeadOut['porte'],
      urgencia: body.urgencia as LeadOut['urgencia'],
      dor: String(body.dor ?? ''),
      status: 'novo',
      canal: derivaCanal(str('utm_source'), str('referrer')),
      origem_pagina: String(body.origem_pagina ?? '/'),
      referrer: str('referrer'),
      utm_source: str('utm_source'),
      utm_medium: str('utm_medium'),
      utm_campaign: str('utm_campaign'),
      utm_content: str('utm_content'),
      utm_term: str('utm_term'),
      consentimento_marketing: body.consentimento_marketing === true,
      created_at: agora,
      status_atualizado_em: agora,
    }
    db.leads.unshift(lead)
    return HttpResponse.json({ id: lead.id }, { status: 201 })
  }),

  // ---- Autenticacao ----
  http.post('*/v1/auth/login', async ({ request }) => {
    const { email, senha } = (await request.json()) as { email?: string; senha?: string }
    if (email?.trim().toLowerCase() !== MOCK_USER.email || senha !== MOCK_PASSWORD)
      return err(401, 'credenciais_invalidas')
    db.sessionExpired = false
    setSession(true)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/v1/auth/logout', () => {
    setSession(false)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/v1/auth/me', () => {
    if (db.sessionExpired || !hasSession()) return err(401, 'nao_autenticado')
    return HttpResponse.json(MOCK_USER)
  }),

  // ---- Leads ----
  http.get('*/v1/leads', ({ request }) => {
    const bad = guard(request)
    if (bad) return bad
    const u = new URL(request.url)
    const status = u.searchParams.get('status')
    const categoria = u.searchParams.get('categoria')
    const q = norm(u.searchParams.get('q') ?? '').trim()
    const page = Math.max(1, Number(u.searchParams.get('page') ?? 1) || 1)
    const limit = Math.min(200, Math.max(1, Number(u.searchParams.get('limit') ?? 50) || 50))

    let items = [...db.leads]
    if (status) items = items.filter((l) => l.status === status)
    if (categoria) items = items.filter((l) => l.categoria === categoria)
    if (q) {
      items = items.filter((l) =>
        norm([l.nome, l.empresa ?? '', l.email, l.whatsapp, l.segmento, l.dor].join(' ')).includes(q),
      )
    }
    items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    const total = items.length
    return HttpResponse.json({ items: items.slice((page - 1) * limit, page * limit), total })
  }),

  http.get('*/v1/leads/:id', ({ request, params }) => {
    const bad = guard(request)
    if (bad) return bad
    const lead = db.leads.find((l) => l.id === params.id)
    if (!lead) return err(404, 'lead_nao_encontrado')
    return HttpResponse.json(detalhe(lead))
  }),

  http.patch('*/v1/leads/:id', async ({ request, params }) => {
    const bad = guard(request)
    if (bad) return bad
    if (db.failNextLeadPatch) {
      const status = db.failNextLeadPatch
      db.failNextLeadPatch = null
      return err(status, 'erro_interno')
    }
    const lead = db.leads.find((l) => l.id === params.id)
    if (!lead) return err(404, 'lead_nao_encontrado')
    const { status } = (await request.json()) as { status?: LeadStatus }
    if (!status || !LEAD_STATUSES.includes(status)) return err(422, 'status_invalido')
    lead.status = status
    lead.status_atualizado_em = new Date().toISOString()
    return HttpResponse.json(lead)
  }),

  http.post('*/v1/leads/:id/notas', async ({ request, params }) => {
    const bad = guard(request)
    if (bad) return bad
    const lead = db.leads.find((l) => l.id === params.id)
    if (!lead) return err(404, 'lead_nao_encontrado')
    const { texto } = (await request.json()) as { texto?: string }
    if (!texto || texto.length < 1 || texto.length > 2000) return err(422, 'texto_invalido')
    const nota = { id: nextId(), texto, created_at: new Date().toISOString() }
    ;(db.notas[lead.id] ??= []).unshift(nota)
    return HttpResponse.json(nota, { status: 201 })
  }),

  http.post('*/v1/leads/:id/projeto', async ({ request, params }) => {
    const bad = guard(request)
    if (bad) return bad
    const lead = db.leads.find((l) => l.id === params.id)
    if (!lead) return err(404, 'lead_nao_encontrado')
    if (db.projetos.some((p) => p.lead_id === lead.id)) return err(409, 'lead_ja_tem_projeto')
    const body = (await request.json()) as { titulo?: string; valor?: unknown; forma_pagamento?: FormaPagamento }
    const valor = normalizaValor(body.valor)
    if (!body.titulo || body.titulo.length < 2 || body.titulo.length > 120 || valor === null)
      return err(422, 'dados_invalidos')
    if (!body.forma_pagamento || !FORMAS.includes(body.forma_pagamento)) return err(422, 'dados_invalidos')
    const agora = new Date().toISOString()
    const projeto: ProjetoOut = {
      id: nextId(),
      lead_id: lead.id,
      lead_nome: lead.nome,
      titulo: body.titulo,
      valor,
      forma_pagamento: body.forma_pagamento,
      status: 'planejamento',
      planejamento: null,
      ultima_atualizacao: null,
      created_at: agora,
      updated_at: agora,
    }
    db.projetos.unshift(projeto)
    lead.status = 'fechado'
    lead.status_atualizado_em = agora
    return HttpResponse.json(projeto, { status: 201 })
  }),

  // ---- Projetos ----
  http.get('*/v1/projetos', ({ request }) => {
    const bad = guard(request)
    if (bad) return bad
    const items = [...db.projetos].sort((a, b) => b.created_at.localeCompare(a.created_at))
    return HttpResponse.json({ items })
  }),

  http.patch('*/v1/projetos/:id', async ({ request, params }) => {
    const bad = guard(request)
    if (bad) return bad
    const projeto = db.projetos.find((p) => p.id === params.id)
    if (!projeto) return err(404, 'projeto_nao_encontrado')
    const body = (await request.json()) as Record<string, unknown>
    if (body.status !== undefined) {
      if (!PROJETO_STATUSES.includes(body.status as ProjetoStatus)) return err(422, 'status_invalido')
      projeto.status = body.status as ProjetoStatus
    }
    if (typeof body.planejamento === 'string') projeto.planejamento = body.planejamento
    if (typeof body.ultima_atualizacao === 'string') projeto.ultima_atualizacao = body.ultima_atualizacao
    if (typeof body.titulo === 'string') projeto.titulo = body.titulo
    if (body.valor !== undefined) {
      const valor = normalizaValor(body.valor)
      if (valor === null) return err(422, 'valor_invalido')
      projeto.valor = valor
    }
    projeto.updated_at = new Date().toISOString()
    return HttpResponse.json(projeto)
  }),

  // ---- Estatisticas ----
  http.get('*/v1/stats', ({ request }) => {
    const bad = guard(request)
    if (bad) return bad
    const dias = Number(new URL(request.url).searchParams.get('dias') ?? 90)
    if (!Number.isInteger(dias) || dias < 7 || dias > 365) return err(422, 'dias_invalido')
    return HttpResponse.json(calcStats(dias))
  }),
]
