import { nomeExibicaoDupla } from '../../lib/useCampeonato'
import { nomeQuadra, nomeGrupo, formatarHorario } from '../../lib/utils'

export default function ListaJogos({ jogos, duplas, quadras, grupos }) {
  const proximos = jogos
    .filter((j) => j.status !== 'finalizado')
    .sort((a, b) => new Date(a.horario_previsto || 0) - new Date(b.horario_previsto || 0))

  const finalizados = jogos
    .filter((j) => j.status === 'finalizado')
    .sort((a, b) => new Date(b.horario_fim_real || b.updated_at) - new Date(a.horario_fim_real || a.updated_at))

  return (
    <div className="flex flex-col gap-5">
      <Bloco titulo="Próximos jogos" itens={proximos} duplas={duplas} quadras={quadras} grupos={grupos} vazio="Nenhum jogo pendente." />
      <Bloco titulo="Jogos finalizados" itens={finalizados} duplas={duplas} quadras={quadras} grupos={grupos} vazio="Nenhum resultado ainda." />
    </div>
  )
}

function Bloco({ titulo, itens, duplas, quadras, grupos, vazio }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between text-[13px] font-bold uppercase tracking-wide text-muted">
        <span>{titulo}</span>
        <span className="font-mono normal-case text-text">{itens.length}</span>
      </div>
      {itens.length === 0 && <div className="text-sm text-muted">{vazio}</div>}
      <div className="flex flex-col gap-3">
        {itens.map((j) => (
          <LinhaJogo key={j.id} jogo={j} duplas={duplas} quadras={quadras} grupos={grupos} />
        ))}
      </div>
    </div>
  )
}

const STATUS_LABEL = { agendado: 'Agendado', em_andamento: 'Ao vivo', finalizado: 'Finalizado' }
const STATUS_COR = { agendado: 'text-muted', em_andamento: 'text-live', finalizado: 'text-faint' }

function LinhaJogo({ jogo, duplas, quadras, grupos }) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-3 text-[13px] last:border-0 last:pb-0">
      <span className="w-12 shrink-0 rounded-md border border-border bg-surface2 py-1 text-center font-mono text-[10.5px] font-bold">
        {nomeQuadra(quadras, jogo.quadra_id).replace('Quadra ', 'Q')}
      </span>
      <span className="min-w-0 flex-1 truncate">
        <span className="mr-2 font-mono text-[10.5px] text-faint uppercase">{nomeGrupo(grupos, jogo.grupo_id) || jogo.fase}</span>
        {nomeExibicaoDupla(duplas.find((d) => d.id === jogo.dupla1_id))}
        <span className="px-1.5 text-faint">×</span>
        {nomeExibicaoDupla(duplas.find((d) => d.id === jogo.dupla2_id))}
      </span>
      {jogo.status === 'finalizado' ? (
        <span className="shrink-0 font-mono font-bold">
          {jogo.pontos_dupla1}-{jogo.pontos_dupla2}
        </span>
      ) : (
        <span className="shrink-0 font-mono text-muted">{formatarHorario(jogo.horario_previsto)}</span>
      )}
      <span className={`w-16 shrink-0 text-right text-[10px] font-bold uppercase ${STATUS_COR[jogo.status]}`}>
        {STATUS_LABEL[jogo.status]}
      </span>
    </div>
  )
}
