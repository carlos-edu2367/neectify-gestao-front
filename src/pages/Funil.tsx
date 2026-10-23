import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLeads, useMudarStatus } from '../api/leads'
import type { Categoria, LeadStatus } from '../api/types'
import { Coluna } from '../funil/Coluna'
import { Filtros } from '../funil/Filtros'
import { useCursorGrosso } from '../funil/useCursorGrosso'
import { LeadDrawer } from './LeadDrawer'
import { agruparPorStatus, COLUNAS } from '../lib/funil'

const LIMITE = 200

export function Funil() {
  const [categoria, setCategoria] = useState<Categoria | undefined>()
  const [q, setQ] = useState('')
  const consulta = useLeads({ categoria, q })
  const { mutate } = useMudarStatus()
  const menu = useCursorGrosso()
  const [params] = useSearchParams()
  const foco = COLUNAS.find((c) => c === params.get('status'))
  const [arrastando, setArrastando] = useState<string | null>(null)

  // Sem TouchSensor: so ponteiro fino arrasta. Distancia minima evita arrastar ao clicar.
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const leads = consulta.data?.items
  const grupos = useMemo(() => agruparPorStatus(leads ?? []), [leads])
  // recalcula a cada atualizacao dos dados
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const agora = useMemo(() => new Date(), [consulta.dataUpdatedAt])
  const onBusca = useCallback((v: string) => setQ(v), [])

  const mover = useCallback(
    (id: string, status: LeadStatus) => {
      const atual = leads?.find((l) => l.id === id)
      if (!atual || atual.status === status) return
      mutate({ id, status })
    },
    [leads, mutate],
  )

  function aoSoltar(e: DragEndEvent) {
    setArrastando(null)
    const destino = e.over?.id
    if (typeof destino === 'string' && (COLUNAS as string[]).includes(destino)) {
      mover(String(e.active.id), destino as LeadStatus)
    }
  }

  const sobrevoando = arrastando ? leads?.find((l) => l.id === arrastando) : undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-mono text-xs uppercase tracking-widest text-muted">Funil</h1>
        <button
          type="button"
          onClick={() => void consulta.refetch()}
          className="rounded-md border border-line px-3 py-1.5 text-sm text-muted hover:text-text"
        >
          Atualizar
        </button>
      </div>

      <Filtros categoria={categoria} onCategoria={setCategoria} onBusca={onBusca} />

      {consulta.data && consulta.data.total > LIMITE && (
        <p className="rounded-md border border-cyan/30 bg-cyan/5 px-3 py-2 font-mono text-xs text-cyan">
          Mostrando os 200 leads mais recentes.
        </p>
      )}

      {consulta.isPending && (
        <p role="status" className="font-mono text-xs uppercase tracking-widest text-muted">
          Carregando
        </p>
      )}
      {consulta.isError && !consulta.data && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível carregar os leads. Use “Atualizar” para tentar de novo.
        </p>
      )}

      {consulta.data && (
        <DndContext
          sensors={sensores}
          onDragStart={(e: DragStartEvent) => setArrastando(String(e.active.id))}
          onDragEnd={aoSoltar}
          onDragCancel={() => setArrastando(null)}
        >
          <div
            data-testid="quadro"
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:snap-none md:px-0"
          >
            {COLUNAS.map((c) => (
              <Coluna key={c} status={c} foco={c === foco} leads={grupos[c]} agora={agora} menu={menu} onMover={mover} />
            ))}
          </div>
          <DragOverlay>
            {sobrevoando ? (
              <div className="w-60 rounded-lg border border-cyan/60 bg-ink-2 p-3 text-sm shadow-xl">
                <p className="truncate font-semibold">{sobrevoando.nome}</p>
                {sobrevoando.empresa && <p className="truncate text-xs text-muted">{sobrevoando.empresa}</p>}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      <LeadDrawer />
    </div>
  )
}
