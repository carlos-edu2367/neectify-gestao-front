import { useEffect, useState } from 'react'
import type { Categoria } from '../api/types'

const CHIPS: { valor: Categoria | undefined; rotulo: string }[] = [
  { valor: undefined, rotulo: 'Todos' },
  { valor: 'site', rotulo: 'Site' },
  { valor: 'automacao', rotulo: 'Automação' },
  { valor: 'ia', rotulo: 'IA' },
  { valor: 'sistema', rotulo: 'Sistema' },
  { valor: 'conversar', rotulo: 'Conversar' },
]

interface Props {
  categoria: Categoria | undefined
  onCategoria: (c: Categoria | undefined) => void
  onBusca: (q: string) => void
}

export function Filtros({ categoria, onCategoria, onBusca }: Props) {
  const [texto, setTexto] = useState('')

  // debounce de 300 ms antes de consultar a API
  useEffect(() => {
    const t = setTimeout(() => onBusca(texto.trim()), 300)
    return () => clearTimeout(t)
  }, [texto, onBusca])

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div role="group" aria-label="Categoria" className="flex flex-wrap gap-1.5">
        {CHIPS.map((c) => {
          const ativo = c.valor === categoria
          return (
            <button
              key={c.rotulo}
              type="button"
              aria-pressed={ativo}
              onClick={() => onCategoria(c.valor)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
                ativo ? 'border-cyan/60 bg-cyan/10 text-cyan' : 'border-line text-muted hover:text-text'
              }`}
            >
              {c.rotulo}
            </button>
          )
        })}
      </div>
      <input
        type="search"
        aria-label="Buscar"
        placeholder="Buscar por nome, empresa, dor…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="w-full rounded-md border border-line bg-ink-2 px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-cyan md:w-72 md:text-sm"
      />
    </div>
  )
}
