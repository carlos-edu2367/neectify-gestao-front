import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAdicionarNota, useConverterProjeto, useLead, useMudarStatus } from '../api/leads'
import { ApiError } from '../api/client'
import type { FormaPagamento, LeadDetail, LeadStatus } from '../api/types'
import { formatarBRL, formatarData, linkWhatsApp, ou, valorParaApi } from '../lib/formatos'
import { COLUNAS } from '../lib/funil'
import {
  CANAL_LABEL,
  CATEGORIA_CURTA,
  CATEGORIA_LABEL,
  CATEGORIA_TAG,
  FORMA_PAGAMENTO_LABEL,
  LEAD_STATUS_LABEL,
  PORTE_LABEL,
  PROJETO_STATUS_LABEL,
  URGENCIA_LABEL,
} from '../lib/labels'

const FORMAS = Object.keys(FORMA_PAGAMENTO_LABEL) as FormaPagamento[]
const campo = 'w-full rounded-md border border-line bg-ink px-3 py-2 text-base text-text md:text-sm'

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-t border-line px-5 py-4">
      <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">{titulo}</h3>
      {children}
    </section>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 py-1 text-sm">
      <dt className="text-muted">{rotulo}</dt>
      <dd className="min-w-0 break-words">{valor}</dd>
    </div>
  )
}

function Notas({ lead }: { lead: LeadDetail }) {
  const [texto, setTexto] = useState('')
  const adicionar = useAdicionarNota(lead.id)
  const limpo = texto.trim()

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!limpo || limpo.length > 2000) return
    adicionar.mutate(limpo, { onSuccess: () => setTexto('') })
  }

  return (
    <Secao titulo="Anotações">
      <form onSubmit={enviar} className="flex flex-col gap-2">
        <label htmlFor="nota-texto" className="sr-only">
          Nova anotação
        </label>
        <textarea
          id="nota-texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Escreva uma anotação"
          className={campo}
        />
        <button
          type="submit"
          disabled={!limpo || adicionar.isPending}
          className="self-end rounded-md border border-line px-3 py-1.5 text-sm hover:border-cyan disabled:opacity-40"
        >
          Adicionar anotação
        </button>
        {adicionar.isError && (
          <p role="alert" className="text-sm text-danger">
            Não foi possível salvar a anotação. Tente de novo.
          </p>
        )}
      </form>
      <ul data-testid="notas" className="mt-3 flex flex-col gap-3">
        {lead.notas.length === 0 && <li className="text-sm text-muted">Nenhuma anotação ainda.</li>}
        {lead.notas.map((n) => (
          <li key={n.id} data-testid="nota" className="rounded-md bg-white/[.03] p-3 text-sm">
            <p className="whitespace-pre-wrap break-words">{n.texto}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">{formatarData(n.created_at)}</p>
          </li>
        ))}
      </ul>
    </Secao>
  )
}

function Conversao({ lead, onConflito }: { lead: LeadDetail; onConflito: (msg: string | null) => void }) {
  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [forma, setForma] = useState<FormaPagamento>('PIX')
  const converter = useConverterProjeto(lead.id)

  if (lead.projeto) {
    const p = lead.projeto
    return (
      <Secao titulo="Projeto">
        <p className="font-semibold">{p.titulo}</p>
        <p className="mt-1 text-sm text-muted">
          {formatarBRL(p.valor)} · {FORMA_PAGAMENTO_LABEL[p.forma_pagamento]} · {PROJETO_STATUS_LABEL[p.status]}
        </p>
        <Link to="/projetos" className="mt-3 inline-block text-sm text-cyan hover:underline">
          Ver em Projetos
        </Link>
      </Secao>
    )
  }

  const valorApi = valorParaApi(valor)
  const valorInvalido = valor.trim() !== '' && valorApi === null
  const tituloLimpo = titulo.trim()
  const valido = tituloLimpo.length >= 2 && tituloLimpo.length <= 120 && valorApi !== null

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!valido || valorApi === null) return
    onConflito(null)
    converter.mutate(
      { titulo: tituloLimpo, valor: valorApi, forma_pagamento: forma },
      {
        onError: (erro) => {
          if (erro instanceof ApiError && erro.status === 409) onConflito('Esse lead já virou projeto.')
        },
      },
    )
  }

  const erroGenerico =
    converter.isError && !(converter.error instanceof ApiError && converter.error.status === 409)

  return (
    <Secao titulo="Converter em projeto">
      <form onSubmit={enviar} className="flex flex-col gap-3" noValidate>
        <div>
          <label htmlFor="proj-titulo" className="mb-1 block text-sm text-muted">
            Título
          </label>
          <input
            id="proj-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={120}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="proj-valor" className="mb-1 block text-sm text-muted">
            Valor
          </label>
          <input
            id="proj-valor"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="R$ 4.500,00"
            aria-invalid={valorInvalido}
            aria-describedby={valorInvalido ? 'proj-valor-erro' : undefined}
            className={campo}
          />
          {valorInvalido && (
            <p id="proj-valor-erro" className="mt-1 text-sm text-danger">
              Valor inválido
            </p>
          )}
        </div>
        <div>
          <label htmlFor="proj-forma" className="mb-1 block text-sm text-muted">
            Forma de pagamento
          </label>
          <select
            id="proj-forma"
            value={forma}
            onChange={(e) => setForma(e.target.value as FormaPagamento)}
            className={campo}
          >
            {FORMAS.map((f) => (
              <option key={f} value={f}>
                {FORMA_PAGAMENTO_LABEL[f]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!valido || converter.isPending}
          className="rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Converter em projeto
        </button>
        {erroGenerico && (
          <p role="alert" className="text-sm text-danger">
            Não foi possível converter o lead. Tente de novo.
          </p>
        )}
      </form>
    </Secao>
  )
}

export function LeadDrawer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const consulta = useLead(id)
  const { mutate: mudarStatus } = useMudarStatus()
  const [conflito, setConflito] = useState<string | null>(null)
  const painel = useRef<HTMLDivElement>(null)

  const fechar = () => navigate('/funil')

  useEffect(() => {
    if (id) painel.current?.focus()
  }, [id])

  useEffect(() => {
    if (!id) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/funil')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [id, navigate])

  if (!id) return null
  const lead = consulta.data
  const tag = lead ? CATEGORIA_TAG[lead.categoria] : null

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={fechar} aria-hidden="true" />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-label="Detalhe do lead"
        tabIndex={-1}
        className="relative flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-ink-2 outline-none md:max-w-lg md:border-l md:border-line"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            {consulta.isPending && (
              <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
                Carregando
              </p>
            )}
            {lead && (
              <>
                <h2 className="break-words text-xl font-semibold">{lead.nome}</h2>
                <p className="text-sm text-muted">{ou(lead.empresa)}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="shrink-0 rounded-md border border-line px-3 py-1.5 font-mono text-xs text-muted hover:text-text"
          >
            Fechar
          </button>
        </div>

        {consulta.isError && (
          <p role="alert" className="px-5 pb-4 text-sm text-danger">
            {consulta.error instanceof ApiError && consulta.error.status === 404
              ? 'Lead não encontrado.'
              : 'Não foi possível carregar o lead.'}
          </p>
        )}

        {lead && tag && (
          <>
            <div className="flex flex-wrap items-center gap-3 px-5 pb-4">
              <span
                className="rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                style={{ color: tag.color, background: tag.background, borderColor: tag.border }}
              >
                {CATEGORIA_CURTA[lead.categoria]}
              </span>
              <label htmlFor="lead-status" className="sr-only">
                Status
              </label>
              <select
                id="lead-status"
                value={lead.status}
                onChange={(e) => mudarStatus({ id: lead.id, status: e.target.value as LeadStatus })}
                className="rounded-md border border-line bg-ink px-2 py-1.5 text-base text-text md:text-sm"
              >
                {COLUNAS.map((c) => (
                  <option key={c} value={c}>
                    {LEAD_STATUS_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 px-5 pb-4">
              <a
                href={linkWhatsApp(lead.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-cyan px-4 py-2.5 text-center text-sm font-semibold text-ink"
              >
                Abrir conversa no WhatsApp
              </a>
              <a href={`mailto:${lead.email}`} className="break-all text-sm text-cyan hover:underline">
                {lead.email}
              </a>
            </div>

            {conflito && (
              <p role="alert" className="mx-5 mb-4 rounded-md border border-danger/50 px-3 py-2 text-sm">
                {conflito}
              </p>
            )}

            <Secao titulo="O que precisa">
              <dl>
                <Linha rotulo="Categoria" valor={CATEGORIA_LABEL[lead.categoria]} />
                <Linha rotulo="Segmento" valor={ou(lead.segmento)} />
                <Linha rotulo="Porte" valor={PORTE_LABEL[lead.porte]} />
                <Linha rotulo="Urgência" valor={URGENCIA_LABEL[lead.urgencia]} />
                <Linha rotulo="Dor" valor={ou(lead.dor)} />
              </dl>
            </Secao>

            <Secao titulo="De onde veio">
              <dl>
                <Linha rotulo="Canal" valor={CANAL_LABEL[lead.canal]} />
                <Linha rotulo="Página" valor={ou(lead.origem_pagina)} />
                <Linha rotulo="Referrer" valor={ou(lead.referrer)} />
                <Linha rotulo="utm_source" valor={ou(lead.utm_source)} />
                <Linha rotulo="utm_medium" valor={ou(lead.utm_medium)} />
                <Linha rotulo="utm_campaign" valor={ou(lead.utm_campaign)} />
                <Linha rotulo="utm_content" valor={ou(lead.utm_content)} />
                <Linha rotulo="utm_term" valor={ou(lead.utm_term)} />
                <Linha rotulo="Chegou em" valor={formatarData(lead.created_at)} />
              </dl>
            </Secao>

            <Secao titulo="Consentimento de marketing">
              <p className="text-sm">{lead.consentimento_marketing ? 'Sim' : 'Não'}</p>
            </Secao>

            <Notas lead={lead} />
            <Conversao lead={lead} onConflito={setConflito} />
          </>
        )}
      </div>
    </div>
  )
}
