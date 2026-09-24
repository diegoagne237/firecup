import { nomeExibicaoDupla } from '../../lib/useCampeonato'
import { nomeQuadra, nomeGrupo, formatarHorario } from '../../lib/utils'

const STATUS_LABEL = { agendado: 'Agendado', em_andamento: 'Ao vivo', finalizado: 'Finalizado' }
const STATUS_COR = { agendado: 'text-muted', em_andamento: 'text-live', finalizado: 'text-faint' }

export default function ListaJogos({ jogos, duplas, quadras, grupos }) {
  const ordenados = jogos
    .slice()
    .sort((a, b) => new Date(a.horario_previsto || 0) - new Date(b.horario_previsto || 0))

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">Todos os jogos</div>
      {ordenados.length === 0 && <div className="text-sm text-muted">Nenhum jogo criado ainda.</div>}
      <div className="flex flex-col gap-2.5">
        {ordenados.map((j) => (
          <div key={j.id} className="flex items-center gap-2.5 border-b border-border pb-2.5 text-[12.5px] last:border-0 last:pb-0">
            <span className="w-11 shrink-0 rounded-md border border-border bg-surface2 py-1 text-center font-mono text-[10.5px] font-bold">
              {nomeQuadra(quadras, j.quadra_id).replace('Quadra ', 'Q')}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="mr-1.5 font-mono text-[10.5px] text-faint uppercase">{nomeGrupo(grupos, j.grupo_id) || j.fase}</span>
              {nomeExibicaoDupla(duplas.find((d) => d.id === j.dupla1_id))}
              <span className="px-1 text-faint">×</span>
              {nomeExibicaoDupla(duplas.find((d) => d.id === j.dupla2_id))}
            </span>
            {j.status === 'finalizado' ? (
              <span className="shrink-0 font-mono font-bold">
                {j.pontos_dupla1}-{j.pontos_dupla2}
              </span>
            ) : (
              <span className="shrink-0 font-mono text-muted">{formatarHorario(j.horario_previsto)}</span>
            )}
            <span className={`w-16 shrink-0 text-right text-[10px] font-bold uppercase ${STATUS_COR[j.status]}`}>
              {STATUS_LABEL[j.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
