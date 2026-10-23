export function linkWhatsApp(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, '')}`
}

/** Aceita "4.500,00", "4500", "R$ 4.500", "4500,5", "4500.00"; devolve "4500.00" ou null se invalido. */
export function valorParaApi(texto: string): string | null {
  const t = texto.replace(/R\$/gi, '').replace(/\s/g, '')
  if (!t) return null
  let numero: string
  if (t.includes(',')) {
    if (!/^(\d{1,3}(\.\d{3})+|\d+),\d{1,2}$/.test(t)) return null
    numero = t.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    numero = t.replace(/\./g, '')
  } else if (/^\d+(\.\d{1,2})?$/.test(t)) {
    numero = t
  } else {
    return null
  }
  return Number(numero).toFixed(2)
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarBRL(valor: string): string {
  return BRL.format(Number(valor))
}

const DATA = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** dd/MM/yyyy HH:mm em America/Sao_Paulo. */
export function formatarData(iso: string): string {
  const p = Object.fromEntries(DATA.formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

export function ou(valor: string | null | undefined): string {
  return valor && valor.trim() ? valor : '—'
}

/** 0.75 -> "75%". */
export function formatarTaxa(t: number): string {
  return `${Math.round(t * 100)}%`
}

/** "YYYY-MM-DD" (data de calendario, nao instante) -> "dd/MM", sem passar por Date/UTC. */
export function rotuloSemana(semana: string): string {
  const [, mes, dia] = semana.split('-')
  return `${dia}/${mes}`
}
