import { useState, useMemo, useEffect } from 'react'
import { useCampeonatos, useCampeonato, nomeExibicaoDupla } from '../lib/useCampeonato'
import { nomeQuadra, formatarHorario } from '../lib/utils'
import QuadrasAoVivo from './QuadrasAoVivo'
import Classificacao from './Classificacao'
import Chaveamento from './Chaveamento'

const TABS = [
  { key: 'jogos', label: 'Jogos' },
  { key: 'classificacao', label: 'Classificação' },
  { key: 'chaveamento', label: 'Chaveamento' },
]

export default function PublicView() {
  const { campeonatos, loading: carregandoLista } = useCampeonatos()
  const visiveis = useMemo(() => campeonatos.filter((c) => c.status !== 'cadastro'), [campeonatos])
  const [campeonatoId, setCampeonatoId] = useState(null)

  useEffect(() => {
    if (!campeonatoId && visiveis.length) {
      const ativo = visiveis.find((c) => c.status === 'em_andamento') || visiveis[0]
      setCampeonatoId(ativo.id)
    }
  }, [visiveis, campeonatoId])

  if (carregandoLista) return <Centro>Carregando…</Centro>
  if (!visiveis.length) return <Centro>Nenhum campeonato em andamento no momento.</Centro>

  return (
    <div className="flex flex-col gap-4">
      {visiveis.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {visiveis.map((c) => (
            <button
              key={c.id}
              onClick={() => setCampeonatoId(c.id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-bold ${
                campeonatoId === c.id ? 'border-pink bg-pink text-white' : 'border-border bg-surface text-muted'
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>
      )}
      {campeonatoId && <CampeonatoPublico campeonatoId={campeonatoId} />}
    </div>
  )
}

function CampeonatoPublico({ campeonatoId }) {
  const { campeonato, quadras, grupos, duplas, jogos, loading } = useCampeonato(campeonatoId)
  const [tab, setTab] = useState('jogos')

  const proximos = useMemo(
    () =>
      jogos
        .filter((j) => j.status === 'agendado')
        .sort((a, b) => new Date(a.horario_previsto || 0) - new Date(b.horario_previsto || 0)),
    [jogos]
  )
  const finalizados = useMemo(
    () =>
      jogos
        .filter((j) => j.status === 'finalizado')
        .sort((a, b) => new Date(b.horario_fim_real || b.updated_at) - new Date(a.horario_fim_real || a.updated_at)),
    [jogos]
  )

  if (loading || !campeonato) return <Centro>Carregando…</Centro>

  const mostrarNivel = campeonato.mostrar_nivel

  return (
    <div className="flex flex-col gap-4">
      <QuadrasAoVivo quadras={quadras} jogos={jogos} duplas={duplas} grupos={grupos} mostrarNivel={mostrarNivel} />

      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[12.5px] font-bold ${
              tab === t.key
                ? 'border-pink bg-surface2 text-text shadow-[0_0_0_1px_theme(colors.pink)_inset]'
                : 'border-border bg-surface text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'jogos' && (
        <div className="flex flex-col gap-4">
          <Card titulo="Próximos jogos">
            {proximos.length === 0 && <VazioLista texto="Nenhum jogo agendado." />}
            {proximos.slice(0, 10).map((j) => (
              <ItemJogo key={j.id} jogo={j} duplas={duplas} quadras={quadras} mostrarNivel={mostrarNivel} />
            ))}
          </Card>

          <Card titulo="Últimos resultados">
            {finalizados.length === 0 && <VazioLista texto="Ainda sem resultados." />}
            {finalizados.slice(0, 10).map((j) => (
              <ItemResultado key={j.id} jogo={j} duplas={duplas} quadras={quadras} mostrarNivel={mostrarNivel} />
            ))}
          </Card>
        </div>
      )}

      {tab === 'classificacao' && <Classificacao grupos={grupos} duplas={duplas} jogos={jogos} mostrarNivel={mostrarNivel} />}

      {tab === 'chaveamento' && <Chaveamento jogos={jogos} duplas={duplas} mostrarNivel={mostrarNivel} />}
    </div>
  )
}

function Card({ titulo, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">{titulo}</div>
      {children}
    </div>
  )
}

function VazioLista({ texto }) {
  return <div className="py-2 text-sm text-muted">{texto}</div>
}

function ItemJogo({ jogo, duplas, quadras, mostrarNivel }) {
  const d1 = duplas.find((d) => d.id === jogo.dupla1_id)
  const d2 = duplas.find((d) => d.id === jogo.dupla2_id)
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <span className="shrink-0 rounded-lg border border-border bg-surface2 px-1.5 py-1 text-center font-mono text-[11px] font-bold">
        {nomeQuadra(quadras, jogo.quadra_id).replace('Quadra ', 'Q')}
      </span>
      <div className="min-w-0 flex-1 text-[13.5px] font-semibold">
        {nomeExibicaoDupla(d1)}
        <span className="px-1.5 text-faint">×</span>
        {nomeExibicaoDupla(d2)}
      </div>
      <span className="shrink-0 text-[11.5px] text-muted">{formatarHorario(jogo.horario_previsto)}</span>
    </div>
  )
}

function ItemResultado({ jogo, duplas, quadras }) {
  const d1 = duplas.find((d) => d.id === jogo.dupla1_id)
  const d2 = duplas.find((d) => d.id === jogo.dupla2_id)
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <span className="shrink-0 rounded-lg border border-border bg-surface2 px-1.5 py-1 text-center font-mono text-[11px] font-bold">
        {nomeQuadra(quadras, jogo.quadra_id).replace('Quadra ', 'Q')}
      </span>
      <div className="min-w-0 flex-1 text-[13.5px] font-semibold">
        {nomeExibicaoDupla(d1)} <b className="font-mono">{jogo.pontos_dupla1}</b>
        <span className="px-1.5 text-faint">×</span>
        <b className="font-mono">{jogo.pontos_dupla2}</b> {nomeExibicaoDupla(d2)}
      </div>
    </div>
  )
}

function Centro({ children }) {
  return <div className="py-16 text-center text-sm text-muted">{children}</div>
}
