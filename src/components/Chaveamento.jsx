import { duplaPorId } from '../lib/utils'
import DuplaChip from './DuplaChip'

const FASES = [
  { key: 'quartas', label: 'Quartas de final' },
  { key: 'semi', label: 'Semifinal' },
  { key: 'terceiro', label: 'Disputa de 3º lugar' },
  { key: 'final', label: 'Final' },
]

export default function Chaveamento({ jogos, duplas, mostrarNivel }) {
  const porFase = (fase) => jogos.filter((j) => j.fase === fase).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  const algumaFase = FASES.some(({ key }) => porFase(key).length > 0)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {!algumaFase && (
        <div className="py-4 text-center text-sm text-muted">
          As fases finais são incluídas pela organização assim que a fase de grupos termina.
        </div>
      )}
      {FASES.map(({ key, label }) => {
        const confrontos = porFase(key)
        if (!confrontos.length) return null
        return (
          <div key={key} className="mb-5 last:mb-0">
            <div className="mb-2 font-display text-xs uppercase tracking-wide text-muted">{label}</div>
            {confrontos.map((j) => (
              <Confronto key={j.id} jogo={j} duplas={duplas} mostrarNivel={mostrarNivel} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function Confronto({ jogo, duplas, mostrarNivel }) {
  const finalizado = jogo.status === 'finalizado'
  const d1 = duplaPorId(duplas, jogo.dupla1_id)
  const d2 = duplaPorId(duplas, jogo.dupla2_id)
  const venceu1 = finalizado && jogo.pontos_dupla1 > jogo.pontos_dupla2
  const venceu2 = finalizado && jogo.pontos_dupla2 > jogo.pontos_dupla1

  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-border bg-surface2">
      <Lado dupla={d1} pontos={jogo.pontos_dupla1} venceu={venceu1} mostrarNivel={mostrarNivel} borda />
      <Lado dupla={d2} pontos={jogo.pontos_dupla2} venceu={venceu2} mostrarNivel={mostrarNivel} />
    </div>
  )
}

function Lado({ dupla, pontos, venceu, mostrarNivel, borda }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 ${borda ? 'border-b border-border' : ''} ${
        venceu ? 'text-pink' : ''
      }`}
    >
      <DuplaChip dupla={dupla} mostrarNivel={mostrarNivel} size="sm" />
      <span className="font-mono text-muted">{pontos ?? '–'}</span>
    </div>
  )
}
