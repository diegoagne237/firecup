import { useState } from 'react'
import { useCampeonato } from '../../lib/useCampeonato'
import Step1DadosGerais from './Step1DadosGerais'
import Step2Duplas from './Step2Duplas'
import Step3Chaveamento from './Step3Chaveamento'
import Step4Jogos from './Step4Jogos'

const ETAPAS = [
  { n: 1, label: 'Dados gerais' },
  { n: 2, label: 'Duplas' },
  { n: 3, label: 'Chaveamento' },
  { n: 4, label: 'Jogos' },
]

export default function CampeonatoWizard({ campeonatoId, onVoltarLista, onConcluido }) {
  const { campeonato, quadras, grupos, duplas, loading, refetch } = useCampeonato(campeonatoId)
  const [etapa, setEtapa] = useState(null)

  if (loading || !campeonato) return <div className="py-16 text-center text-sm text-muted">Carregando…</div>

  const etapaAtual = etapa ?? campeonato.etapa_cadastro ?? 1

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <button onClick={onVoltarLista} className="text-xs text-faint underline">
          ← campeonatos
        </button>
        <span className="text-xs text-muted">{campeonato.nome || 'Novo campeonato'}</span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl gap-2">
        {ETAPAS.map((e) => (
          <div
            key={e.n}
            className={`flex-1 rounded-full py-2 text-center text-[10.5px] font-bold uppercase tracking-wide ${
              e.n === etapaAtual ? 'bg-pink text-white' : e.n < etapaAtual ? 'bg-pink/25 text-pink' : 'bg-surface2 text-faint'
            }`}
          >
            {e.n}. {e.label}
          </div>
        ))}
      </div>

      {etapaAtual === 1 && <Step1DadosGerais campeonato={campeonato} quadras={quadras} onAvancar={() => setEtapa(2)} />}
      {etapaAtual === 2 && (
        <Step2Duplas campeonato={campeonato} duplas={duplas} refetch={refetch} onVoltar={() => setEtapa(1)} onAvancar={() => setEtapa(3)} />
      )}
      {etapaAtual === 3 && (
        <Step3Chaveamento campeonato={campeonato} grupos={grupos} duplas={duplas} onVoltar={() => setEtapa(2)} onAvancar={() => setEtapa(4)} />
      )}
      {etapaAtual === 4 && (
        <Step4Jogos
          campeonato={campeonato}
          quadras={quadras}
          grupos={grupos}
          duplas={duplas}
          onVoltar={() => setEtapa(3)}
          onConcluir={onConcluido}
        />
      )}
    </div>
  )
}
