import { useQuery } from '@tanstack/react-query'
import { listLeads } from '../api/leads'

// Placeholder: o quadro real entra na tarefa P3. Ja consulta /v1/leads para exercitar a sessao.
export function Funil() {
  const q = useQuery({ queryKey: ['leads'], queryFn: () => listLeads({ limit: 200 }) })
  return (
    <div>
      <h1 className="font-mono text-xs uppercase tracking-widest text-muted">Funil</h1>
      <button
        type="button"
        onClick={() => void q.refetch()}
        className="mt-3 rounded-md border border-line px-3 py-1.5 text-sm"
      >
        Atualizar
      </button>
    </div>
  )
}
