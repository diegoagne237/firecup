import { nomeDupla } from './LiveMatch'

const FASES = [
  { key: 'quartas', label: 'Quartas de final' },
  { key: 'semi', label: 'Semifinal' },
  { key: 'terceiro', label: 'Disputa de 3º lugar' },
  { key: 'final', label: 'Final' },
]

export default function Chaveamento({ jogos, duplas }) {
  const porFase = (fase) => jogos.filter((j) => j.fase === fase).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {FASES.map(({ key, label }) => {
        const confrontos = porFase(key)
        if (!confrontos.length) return null
        return (
          <div key={key} className="mb-5 last:mb-0">
            <div className="mb-2 font-display text-xs uppercase tracking-wide text-muted">{label}</div>
            {confrontos.map((j) => (
              <Confronto key={j.id} jogo={j} duplas={duplas} />
            ))}
          </div>
        )
      })}
      {FASES.every(({ key }) => porFase(key).length === 0) && (
        <div className="py-4 text-center text-sm text-muted">
          Chaveamento do mata-mata ainda não foi gerado.
        </div>
      )}
    </div>
  )
}

function Confronto({ jogo, duplas }) {
  const finalizado = jogo.status === 'finalizado'
  const nome1 = jogo.dupla1_id ? nomeDupla(duplas, jogo.dupla1_id) : 'A definir'
  const nome2 = jogo.dupla2_id ? nomeDupla(duplas, jogo.dupla2_id) : 'A definir'
  const venceu1 = finalizado && jogo.pontos_dupla1 > jogo.pontos_dupla2
  const venceu2 = finalizado && jogo.pontos_dupla2 > jogo.pontos_dupla1

  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-border bg-surface2">
      <Lado nome={nome1} pontos={jogo.pontos_dupla1} venceu={venceu1} definido={!!jogo.dupla1_id} borda />
      <Lado nome={nome2} pontos={jogo.pontos_dupla2} venceu={venceu2} definido={!!jogo.dupla2_id} />
    </div>
  )
}

function Lado({ nome, pontos, venceu, definido, borda }) {
  return (
    <div
      className={`flex justify-between px-3 py-2 text-[13px] font-semibold ${
        borda ? 'border-b border-border' : ''
      } ${venceu ? 'text-pink' : definido ? 'text-text' : 'text-faint'}`}
    >
      <span>{nome}</span>
      <span className="font-mono text-muted">{pontos ?? '–'}</span>
    </div>
  )
}
