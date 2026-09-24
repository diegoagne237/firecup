import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { nomeExibicaoDupla } from '../../lib/useCampeonato'

const FASES = [
  { key: 'quartas', label: 'Quartas de final' },
  { key: 'semi', label: 'Semifinal' },
  { key: 'terceiro', label: 'Disputa de 3º lugar' },
  { key: 'final', label: 'Final' },
]

// As fases finais não são geradas automaticamente — a organização inclui cada
// confronto manualmente, à medida que os grupos terminam e ela decide os
// cruzamentos (1º do grupo A x 2º do grupo B, etc).
export default function GestaoFasesFinais({ campeonato, quadras, duplas, jogos, refetch }) {
  const [fase, setFase] = useState('quartas')
  const [dupla1Id, setDupla1Id] = useState('')
  const [dupla2Id, setDupla2Id] = useState('')
  const [quadraId, setQuadraId] = useState(quadras[0]?.id || '')
  const [horario, setHorario] = useState('')
  const [salvando, setSalvando] = useState(false)

  const fasesJogos = jogos.filter((j) => j.fase !== 'grupo')

  async function adicionar(e) {
    e.preventDefault()
    if (!dupla1Id && !dupla2Id) return
    setSalvando(true)
    await supabase.from('jogos').insert({
      campeonato_id: campeonato.id,
      fase,
      quadra_id: quadraId || null,
      dupla1_id: dupla1Id || null,
      dupla2_id: dupla2Id || null,
      status: 'agendado',
      horario_previsto: horario ? new Date(horario).toISOString() : null,
      ordem: fasesJogos.length,
    })
    setSalvando(false)
    setDupla1Id('')
    setDupla2Id('')
    setHorario('')
    refetch()
  }

  async function remover(id) {
    await supabase.from('jogos').delete().eq('id', id)
    refetch()
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">Fases finais</div>

      <form onSubmit={adicionar} className="flex flex-col gap-2.5">
        <select className="input" value={fase} onChange={(e) => setFase(e.target.value)}>
          {FASES.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
        <select className="input" value={dupla1Id} onChange={(e) => setDupla1Id(e.target.value)}>
          <option value="">Dupla 1 (opcional se ainda não definida)</option>
          {duplas.map((d) => (
            <option key={d.id} value={d.id}>
              {nomeExibicaoDupla(d)}
            </option>
          ))}
        </select>
        <select className="input" value={dupla2Id} onChange={(e) => setDupla2Id(e.target.value)}>
          <option value="">Dupla 2 (opcional se ainda não definida)</option>
          {duplas.map((d) => (
            <option key={d.id} value={d.id}>
              {nomeExibicaoDupla(d)}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2.5">
          <select className="input" value={quadraId} onChange={(e) => setQuadraId(e.target.value)}>
            {quadras.map((q) => (
              <option key={q.id} value={q.id}>
                Quadra {q.numero}
              </option>
            ))}
          </select>
          <input type="datetime-local" className="input" value={horario} onChange={(e) => setHorario(e.target.value)} />
        </div>
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? 'Adicionando…' : '+ Adicionar confronto'}
        </button>
      </form>

      {fasesJogos.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3.5">
          {fasesJogos.map((j) => (
            <div key={j.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="min-w-0 truncate">
                <span className="mr-1.5 font-mono text-faint uppercase">{j.fase}</span>
                {nomeExibicaoDupla(duplas.find((d) => d.id === j.dupla1_id))}
                <span className="px-1 text-faint">×</span>
                {nomeExibicaoDupla(duplas.find((d) => d.id === j.dupla2_id))}
                {j.status === 'finalizado' && (
                  <span className="ml-1.5 font-mono text-live">
                    {j.pontos_dupla1}-{j.pontos_dupla2}
                  </span>
                )}
              </span>
              <button onClick={() => remover(j.id)} className="shrink-0 text-[11px] text-faint underline">
                remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
