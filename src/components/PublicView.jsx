import { useState, useMemo } from 'react'
import { useCampeonato } from '../lib/useCampeonato'
import LiveMatch, { nomeDupla, nomeQuadra } from './LiveMatch'
import Classificacao from './Classificacao'
import Chaveamento from './Chaveamento'

const TABS = [
  { key: 'ao-vivo', label: 'Ao Vivo' },
  { key: 'classificacao', label: 'Classificação' },
  { key: 'chaveamento', label: 'Chaveamento' },
]

export default function PublicView() {
  const { campeonato, quadras, grupos, duplas, jogos, loading, erro } = useCampeonato()
  const [tab, setTab] = useState('ao-vivo')

  const jogoAoVivo = useMemo(() => jogos.find((j) => j.status === 'em_andamento'), [jogos])
  const proximos = useMemo(
    () => jogos.filter((j) => j.status === 'agendado').slice(0, 6),
    [jogos]
  )
  const finalizados = useMemo(
    () =>
      jogos
        .filter((j) => j.status === 'finalizado')
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 6),
    [jogos]
  )

  if (loading) return <Centro>Carregando campeonato…</Centro>
  if (erro) return <Centro>{erro}</Centro>

  return (
    <div className="flex flex-col gap-4">
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

      {tab === 'ao-vivo' && (
        <div className="flex flex-col gap-4">
          <LiveMatch jogo={jogoAoVivo} duplas={duplas} quadras={quadras} grupos={grupos} />

          <Card titulo="Próximos jogos">
            {proximos.length === 0 && <VazioLista texto="Nenhum jogo agendado." />}
            {proximos.map((j) => (
              <ItemJogo key={j.id} jogo={j} duplas={duplas} quadras={quadras} />
            ))}
          </Card>

          <Card titulo="Últimos resultados">
            {finalizados.length === 0 && <VazioLista texto="Ainda sem resultados." />}
            {finalizados.map((j) => (
              <ItemResultado key={j.id} jogo={j} duplas={duplas} quadras={quadras} />
            ))}
          </Card>
        </div>
      )}

      {tab === 'classificacao' && <Classificacao grupos={grupos} duplas={duplas} jogos={jogos} />}

      {tab === 'chaveamento' && <Chaveamento jogos={jogos} duplas={duplas} />}
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

function ItemJogo({ jogo, duplas, quadras }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <span className="shrink-0 rounded-lg border border-border bg-surface2 px-1.5 py-1 text-center font-mono text-[11px] font-bold">
        {nomeQuadra(quadras, jogo.quadra_id).replace('Quadra ', 'Q')}
      </span>
      <div className="min-w-0 flex-1 text-[13.5px] font-semibold">
        {nomeDupla(duplas, jogo.dupla1_id)}
        <span className="px-1.5 text-faint">×</span>
        {nomeDupla(duplas, jogo.dupla2_id)}
      </div>
      {jogo.horario && (
        <span className="shrink-0 text-[11.5px] text-muted">
          {new Date(jogo.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}

function ItemResultado({ jogo, duplas, quadras }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <span className="shrink-0 rounded-lg border border-border bg-surface2 px-1.5 py-1 text-center font-mono text-[11px] font-bold">
        {nomeQuadra(quadras, jogo.quadra_id).replace('Quadra ', 'Q')}
      </span>
      <div className="min-w-0 flex-1 text-[13.5px] font-semibold">
        {nomeDupla(duplas, jogo.dupla1_id)}{' '}
        <b className="font-mono">{jogo.pontos_dupla1}</b>
        <span className="px-1.5 text-faint">×</span>
        <b className="font-mono">{jogo.pontos_dupla2}</b> {nomeDupla(duplas, jogo.dupla2_id)}
      </div>
    </div>
  )
}

function Centro({ children }) {
  return <div className="py-16 text-center text-sm text-muted">{children}</div>
}
