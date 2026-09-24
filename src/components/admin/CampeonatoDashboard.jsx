import { useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useCampeonato } from '../../lib/useCampeonato'
import AdminQuadraCard from './AdminQuadraCard'
import ListaJogos from './ListaJogos'
import Classificacao from '../Classificacao'
import GestaoFasesFinais from './GestaoFasesFinais'

export default function CampeonatoDashboard({ campeonatoId, onVoltarLista }) {
  const { campeonato, quadras, grupos, duplas, jogos, loading, refetch } = useCampeonato(campeonatoId)

  const finalizadosCount = useMemo(() => jogos.filter((j) => j.status === 'finalizado').length, [jogos])

  async function finalizarCampeonato() {
    await supabase.from('campeonatos').update({ status: 'finalizado' }).eq('id', campeonatoId)
    refetch()
  }

  if (loading || !campeonato) return <div className="py-16 text-center text-sm text-muted">Carregando…</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onVoltarLista} className="text-xs text-faint underline">
          ← campeonatos
        </button>
        {campeonato.status === 'em_andamento' && (
          <button onClick={finalizarCampeonato} className="text-xs font-bold text-gold">
            Finalizar campeonato
          </button>
        )}
      </div>

      <div>
        <div className="font-display text-lg tracking-wide">{campeonato.nome}</div>
        {campeonato.categoria && <div className="text-xs text-muted">{campeonato.categoria}</div>}
      </div>

      <div className="flex gap-2.5">
        <StatusPill label="Duplas" valor={duplas.length} />
        <StatusPill label="Quadras" valor={quadras.length} />
        <StatusPill label="Jogos feitos" valor={`${finalizadosCount}/${jogos.length}`} />
      </div>

      <div className="flex flex-col gap-3">
        {quadras.map((q) => (
          <AdminQuadraCard key={q.id} quadra={q} jogos={jogos} duplas={duplas} grupos={grupos} campeonato={campeonato} refetch={refetch} />
        ))}
      </div>

      <Classificacao grupos={grupos} duplas={duplas} jogos={jogos} mostrarNivel />

      <GestaoFasesFinais campeonato={campeonato} quadras={quadras} duplas={duplas} jogos={jogos} refetch={refetch} />

      <ListaJogos jogos={jogos} duplas={duplas} quadras={quadras} grupos={grupos} />
    </div>
  )
}

function StatusPill({ label, valor }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-surface2 px-1 py-2.5 text-center">
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-mono text-[17px] font-bold">{valor}</div>
    </div>
  )
}
