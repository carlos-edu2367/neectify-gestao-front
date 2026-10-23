import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStats, type Periodo } from '../api/stats'
import type { Canal, Categoria } from '../api/types'
import { formatarTaxa, rotuloSemana } from '../lib/formatos'
import { CANAL_LABEL, CATEGORIA_LABEL } from '../lib/labels'

const PERIODOS: Periodo[] = [30, 90, 180]
const CIANO = '#2EE6F0'

function Tile({ rotulo, valor, to }: { rotulo: string; valor: string; to?: string }) {
  const corpo = (
    <>
      <span className="font-mono text-xs uppercase tracking-widest text-muted">{rotulo}</span>
      <span className="font-display text-4xl tabular-nums text-text">{valor}</span>
      {to && <span className="font-mono text-xs text-cyan">Ver no funil →</span>}
    </>
  )
  const cls = 'flex flex-col gap-1 rounded-xl border border-line bg-ink-2 p-4'
  return to ? (
    <Link to={to} data-testid="indicador" className={`${cls} hover:border-cyan/60`}>
      {corpo}
    </Link>
  ) : (
    <div data-testid="indicador" className={cls}>
      {corpo}
    </div>
  )
}

function Painel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className="min-w-0 rounded-xl border border-line bg-ink-2 p-4">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">{titulo}</h2>
      {children}
    </section>
  )
}

interface Item {
  chave: string
  rotulo: string
  total: number
}

/** Barras horizontais com todas as chaves, inclusive zeros. Uma serie so: ciano. */
function BarrasH({ titulo, itens }: { titulo: string; itens: Item[] }) {
  const max = Math.max(1, ...itens.map((i) => i.total))
  return (
    <Painel titulo={titulo}>
      <ul className="flex flex-col gap-3">
        {itens.map((i) => (
          <li key={i.chave} data-testid="barra-h" title={`${i.rotulo}: ${i.total}`}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-text">{i.rotulo}</span>
              <span className="font-mono tabular-nums text-muted">{i.total}</span>
            </div>
            <div className="h-2 rounded-r bg-white/[.04]">
              <div className="h-2 rounded-r" style={{ width: `${(i.total / max) * 100}%`, background: CIANO }} />
            </div>
          </li>
        ))}
      </ul>
    </Painel>
  )
}

function BarrasSemana({ dados }: { dados: { semana: string; total: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.total))
  const H = 140
  const passo = Math.max(1, Math.ceil(dados.length / 6)) // rotulos seletivos no eixo
  return (
    <Painel titulo="Leads por semana">
      <div className="flex items-end gap-0.5" style={{ height: H }} role="img" aria-label="Leads por semana">
        {dados.map((d) => (
          <div
            key={d.semana}
            data-testid="barra-semana"
            title={`Semana de ${rotuloSemana(d.semana)}: ${d.total}`}
            className="group flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <span className="mb-1 text-center font-mono text-[10px] text-muted opacity-0 group-hover:opacity-100">
              {d.total}
            </span>
            <div
              className="rounded-t"
              style={{
                height: `${(d.total / max) * (H - 18)}px`,
                minHeight: d.total ? 2 : 1,
                background: d.total ? CIANO : 'rgba(255,255,255,.12)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-0.5" aria-hidden="true">
        {dados.map((d, i) => (
          <span key={d.semana} className="min-w-0 flex-1 whitespace-nowrap font-mono text-[10px] text-muted">
            {i % passo === 0 ? rotuloSemana(d.semana) : ''}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Leads por semana</caption>
        <tbody>
          {dados.map((d) => (
            <tr key={d.semana}>
              <th>{rotuloSemana(d.semana)}</th>
              <td>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Painel>
  )
}

export function Dashboard() {
  const [dias, setDias] = useState<Periodo>(90)
  const { data, isPending, isError, refetch } = useStats(dias)
  const totalLeads = data?.leads_por_semana.reduce((s, x) => s + x.total, 0) ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-mono text-xs uppercase tracking-widest text-muted">Dashboard</h1>
        <div role="group" aria-label="Período" className="flex gap-1">
          {PERIODOS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={dias === p}
              onClick={() => setDias(p)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                dias === p ? 'border-cyan/60 bg-cyan/10 text-cyan' : 'border-line text-muted hover:text-text'
              }`}
            >
              {p} dias
            </button>
          ))}
        </div>
      </div>

      {isPending && (
        <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
          Carregando
        </p>
      )}
      {isError && !data && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os números.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Tentar de novo
          </button>
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile rotulo="Leads no período" valor={String(totalLeads)} />
            <Tile rotulo="Taxa de fechamento" valor={formatarTaxa(data.taxa_fechamento)} />
            <Tile rotulo="Leads parados" valor={String(data.parados)} to="/funil?status=novo" />
          </div>
          <BarrasSemana dados={data.leads_por_semana} />
          <div className="grid gap-4 lg:grid-cols-2">
            <BarrasH
              titulo="Por categoria"
              itens={(Object.keys(CATEGORIA_LABEL) as Categoria[]).map((k) => ({
                chave: k,
                rotulo: CATEGORIA_LABEL[k],
                total: data.por_categoria[k] ?? 0,
              }))}
            />
            <BarrasH
              titulo="Por canal"
              itens={(Object.keys(CANAL_LABEL) as Canal[]).map((k) => ({
                chave: k,
                rotulo: CANAL_LABEL[k],
                total: data.por_canal[k] ?? 0,
              }))}
            />
          </div>
        </>
      )}
    </div>
  )
}
