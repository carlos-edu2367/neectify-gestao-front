import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAtualizarProjeto, useProjetos } from '../api/projetos'
import type { ProjetoOut, ProjetoStatus } from '../api/types'
import { formatarBRL, formatarData, ou } from '../lib/formatos'
import { FORMA_PAGAMENTO_LABEL, PROJETO_STATUS_LABEL } from '../lib/labels'

const STATUSES = Object.keys(PROJETO_STATUS_LABEL) as ProjetoStatus[]
const campo =
  'w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:border-cyan/60 focus:outline-none'
const botao =
  'self-start rounded-md border border-cyan/60 bg-cyan/10 px-3 py-1.5 text-sm text-cyan disabled:opacity-50'

function ProjetoItem({ projeto: p }: { projeto: ProjetoOut }) {
  const { mutate, isPending } = useAtualizarProjeto(p.id)
  const [atualizacao, setAtualizacao] = useState(p.ultima_atualizacao ?? '')
  const [plano, setPlano] = useState(p.planejamento ?? '')
  const [aberto, setAberto] = useState(false)
  const uid = `proj-${p.id}`

  return (
    <li data-testid="projeto" className="flex flex-col gap-4 rounded-xl border border-line bg-ink-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg text-text">{p.titulo}</h2>
          <p className="text-sm text-muted">
            Cliente:{' '}
            <Link to={`/leads/${p.lead_id}`} className="text-cyan underline">
              {p.lead_nome}
            </Link>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl tabular-nums text-text">{formatarBRL(p.valor)}</p>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {FORMA_PAGAMENTO_LABEL[p.forma_pagamento]}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${uid}-status`} className="font-mono text-xs uppercase tracking-widest text-muted">
            Status
          </label>
          <select
            id={`${uid}-status`}
            className={campo}
            value={p.status}
            disabled={isPending}
            onChange={(e) => mutate({ status: e.target.value as ProjetoStatus })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {PROJETO_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-upd`} className="font-mono text-xs uppercase tracking-widest text-muted">
            Última atualização
          </label>
          <textarea
            id={`${uid}-upd`}
            rows={2}
            className={campo}
            value={atualizacao}
            onChange={(e) => setAtualizacao(e.target.value)}
          />
          <button
            type="button"
            className={botao}
            disabled={isPending || atualizacao === (p.ultima_atualizacao ?? '')}
            onClick={() => mutate({ ultima_atualizacao: atualizacao })}
          >
            Salvar atualização
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-expanded={aberto}
          onClick={() => setAberto((v) => !v)}
          className="self-start font-mono text-xs uppercase tracking-widest text-muted hover:text-text"
        >
          Planejamento {aberto ? '▲' : '▼'}
        </button>
        {aberto && (
          <>
            <label htmlFor={`${uid}-plano`} className="sr-only">
              Planejamento
            </label>
            <textarea
              id={`${uid}-plano`}
              rows={5}
              className={campo}
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
            />
            <button
              type="button"
              className={botao}
              disabled={isPending || plano === (p.planejamento ?? '')}
              onClick={() => mutate({ planejamento: plano })}
            >
              Salvar planejamento
            </button>
          </>
        )}
      </div>

      <p className="font-mono text-xs text-muted">
        Criado em {formatarData(p.created_at)} · Atualizado em{' '}
        <span data-testid="atualizado-em">{ou(formatarData(p.updated_at))}</span>
      </p>
    </li>
  )
}

export function Projetos() {
  const { data, isPending, isError, refetch } = useProjetos()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-mono text-xs uppercase tracking-widest text-muted">Projetos</h1>
      {isPending && (
        <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
          Carregando
        </p>
      )}
      {isError && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os projetos.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Tentar de novo
          </button>
        </p>
      )}
      {data && data.items.length === 0 && (
        <p className="text-sm text-muted">Nenhum projeto ainda. Converta um lead fechado em projeto.</p>
      )}
      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {data.items.map((p) => (
            <ProjetoItem key={p.id} projeto={p} />
          ))}
        </ul>
      )}
    </div>
  )
}
