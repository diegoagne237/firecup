function nomeDupla(duplas, id) {
  return duplas.find((d) => d.id === id)?.nome || '—'
}
function nomeQuadra(quadras, id) {
  const q = quadras.find((q) => q.id === id)
  return q ? `Quadra ${q.numero}` : '—'
}
function nomeGrupo(grupos, id) {
  return grupos.find((g) => g.id === id)?.nome || null
}

// Card do jogo em andamento. Nunca mostra placar ao vivo — só quem está
// jogando e onde. O placar só existe quando o jogo é finalizado.
export default function LiveMatch({ jogo, duplas, quadras, grupos }) {
  if (!jogo) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm text-muted">
        Nenhum jogo em andamento no momento.
      </div>
    )
  }

  const grupoNome = nomeGrupo(grupos, jogo.grupo_id)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-pinkdeep bg-gradient-to-br from-surface2 to-surface p-5 shadow-[0_18px_40px_-20px_rgba(255,47,126,0.35)]">
      <div className="inline-flex items-center gap-2 rounded-full bg-live/10 px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-live">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
        </span>
        Ao vivo · {nomeQuadra(quadras, jogo.quadra_id)}
      </div>
      <div className="mt-2.5 text-xs text-muted">
        {jogo.fase === 'grupo' ? `Fase de grupos${grupoNome ? ' · ' + grupoNome : ''}` : `Fase: ${jogo.fase}`}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold">{nomeDupla(duplas, jogo.dupla1_id)}</div>
        </div>
        <div className="font-display text-sm text-faint">VS</div>
        <div className="min-w-0 text-right">
          <div className="truncate text-base font-extrabold">{nomeDupla(duplas, jogo.dupla2_id)}</div>
        </div>
      </div>
    </div>
  )
}

export { nomeDupla, nomeQuadra, nomeGrupo }
