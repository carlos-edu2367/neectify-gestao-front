import { useDraggable } from '@dnd-kit/core'
import { Link, useNavigate } from 'react-router-dom'
import type { LeadOut, LeadStatus } from '../api/types'
import { COLUNAS, diasParado, estaParado } from '../lib/funil'
import { CANAL_LABEL, CATEGORIA_CURTA, CATEGORIA_TAG, LEAD_STATUS_LABEL, URGENCIA_LABEL } from '../lib/labels'

interface Props {
  lead: LeadOut
  agora: Date
  /** true em toque: sem arraste; o menu "Mover para…" fica grande. */
  menu: boolean
  onMover: (id: string, status: LeadStatus) => void
}

function textoParado(dias: number) {
  if (dias === 0) return 'atualizado hoje'
  return `parado há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
}

export function CardLead({ lead, agora, menu, onMover }: Props) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id, disabled: menu })
  const parado = estaParado(lead, agora)
  const tag = CATEGORIA_TAG[lead.categoria]
  const dias = diasParado(lead.status_atualizado_em, agora)

  return (
    <article
      ref={setNodeRef}
      data-testid="card-lead"
      data-nome={lead.nome}
      data-categoria={lead.categoria}
      data-parado={parado}
      onClick={() => navigate(`/leads/${lead.id}`)}
      {...(menu ? {} : { ...attributes, ...listeners })}
      className={`cursor-pointer rounded-lg border bg-ink-2 p-3 text-left transition-colors hover:border-white/20 ${
        parado ? 'border-cyan/50 shadow-[inset_3px_0_0_var(--color-cyan)]' : 'border-line'
      } ${isDragging ? 'opacity-40' : ''} ${menu ? '' : 'touch-manipulation select-none'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            to={`/leads/${lead.id}`}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            className="block truncate font-semibold hover:text-cyan"
          >
            {lead.nome}
          </Link>
          {lead.empresa && <p className="truncate text-xs text-muted">{lead.empresa}</p>}
        </div>
        <span
          className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide"
          style={{ color: tag.color, background: tag.background, borderColor: tag.border }}
        >
          {CATEGORIA_CURTA[lead.categoria]}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-text/80">{lead.dor}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
        <span>{URGENCIA_LABEL[lead.urgencia]}</span>
        <span aria-hidden="true">·</span>
        <span>{CANAL_LABEL[lead.canal]}</span>
      </div>
      <p className={`mt-1.5 font-mono text-[11px] ${parado ? 'font-medium text-cyan' : 'text-muted'}`}>
        {textoParado(dias)}
      </p>
      <select
        aria-label="Mover para…"
        value=""
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          if (e.target.value) onMover(lead.id, e.target.value as LeadStatus)
        }}
        className={
          menu
            ? 'mt-2.5 block w-full rounded-md border border-line bg-ink px-2 py-2 text-base text-text'
            : 'mt-2 block w-full rounded border border-line bg-ink px-1.5 py-1 font-mono text-[11px] text-muted hover:text-text'
        }
      >
        <option value="">Mover para…</option>
        {COLUNAS.filter((c) => c !== lead.status).map((c) => (
          <option key={c} value={c}>
            {LEAD_STATUS_LABEL[c]}
          </option>
        ))}
      </select>
    </article>
  )
}
