import { useDroppable } from '@dnd-kit/core'
import type { LeadOut, LeadStatus } from '../api/types'
import { LEAD_STATUS_LABEL } from '../lib/labels'
import { CardLead } from './CardLead'

interface Props {
  status: LeadStatus
  leads: LeadOut[]
  agora: Date
  menu: boolean
  onMover: (id: string, status: LeadStatus) => void
}

export function Coluna({ status, leads, agora, menu, onMover }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: menu })
  const titulo = LEAD_STATUS_LABEL[status]
  return (
    <section
      ref={setNodeRef}
      aria-label={titulo}
      className={`flex w-[82vw] max-w-80 shrink-0 snap-start flex-col rounded-xl border bg-white/[.02] md:w-auto md:max-w-none md:min-w-48 md:flex-1 ${
        isOver ? 'border-cyan/60' : 'border-line'
      }`}
    >
      <header className="flex items-center justify-between px-3 py-2.5">
        <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-muted">{titulo}</h2>
        <span
          data-testid="contagem"
          className="rounded bg-white/[.06] px-1.5 py-0.5 font-mono text-xs tabular-nums text-text"
        >
          {leads.length}
        </span>
      </header>
      <div className="flex min-h-24 flex-col gap-2 px-2 pb-2">
        {leads.map((l) => (
          <CardLead key={l.id} lead={l} agora={agora} menu={menu} onMover={onMover} />
        ))}
        {leads.length === 0 && (
          <p className="px-1 py-6 text-center font-mono text-xs text-muted/70">Nenhum lead</p>
        )}
      </div>
    </section>
  )
}
