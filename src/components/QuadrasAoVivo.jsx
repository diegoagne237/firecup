import DuplaChip from './DuplaChip'
import { duplaPorId, formatarHorario, nomeGrupo } from '../lib/utils'

// Bloco principal da tela: mostra, para cada quadra, o jogo em andamento
// (sem placar — só quem está jogando) e os próximos 2 com horário previsto.
export default function QuadrasAoVivo({ quadras, jogos, duplas, grupos, mostrarNivel }) {
  return (
    <div className="flex flex-col gap-3">
      {quadras.map((quadra) => {
        const daQuadra = jogos
          .filter((j) => j.quadra_id === quadra.id && j.fase === 'grupo')
          .concat(jogos.filter((j) => j.quadra_id === quadra.id && j.fase !== 'grupo'))
        const atual = daQuadra.find((j) => j.status === 'em_andamento')
        const proximos = daQuadra
          .filter((j) => j.status === 'agendado')
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .slice(0, 2)

        return (
          <div key={quadra.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm tracking-wide">
                Quadra {quadra.numero}
                {quadra.descricao && <span className="ml-1.5 font-body text-xs font-normal text-faint">{quadra.descricao}</span>}
              </span>
              {atual && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-live">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
                  </span>
                  Ao vivo
                </span>
              )}
            </div>

            {atual ? (
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <DuplaChip dupla={duplaPorId(duplas, atual.dupla1_id)} mostrarNivel={mostrarNivel} />
                <span className="font-display text-xs text-faint">VS</span>
                <div className="text-right">
                  <DuplaChip dupla={duplaPorId(duplas, atual.dupla2_id)} mostrarNivel={mostrarNivel} />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">Quadra livre no momento.</div>
            )}

            {proximos.length > 0 && (
              <div className="mt-3.5 flex flex-col gap-2 border-t border-border pt-3">
                {proximos.map((j) => (
                  <div key={j.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span className="min-w-0 truncate font-semibold">
                      {duplaPorId(duplas, j.dupla1_id)?.atleta1_apelido ? `${nomeExibicaoCompacta(duplas, j.dupla1_id)} × ${nomeExibicaoCompacta(duplas, j.dupla2_id)}` : '—'}
                    </span>
                    <span className="shrink-0 font-mono text-muted">
                      {formatarHorario(j.horario_previsto)}
                      {j.fase !== 'grupo' && <span className="ml-1 text-faint">· {j.fase}</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function nomeExibicaoCompacta(duplas, id) {
  const d = duplaPorId(duplas, id)
  return d ? `${d.atleta1_apelido} & ${d.atleta2_apelido}` : 'A definir'
}
