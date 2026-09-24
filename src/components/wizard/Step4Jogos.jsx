import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { gerarConfrontosDeGrupos, distribuirNasQuadras } from '../../lib/scheduling'
import { nomeGrupo, formatarHorario } from '../../lib/utils'

export default function Step4Jogos({ campeonato, quadras, grupos, duplas, onVoltar, onConcluir }) {
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0) // força recalcular o preview

  const duplasPorGrupo = useMemo(() => {
    const mapa = {}
    grupos.forEach((g) => {
      mapa[g.id] = duplas.filter((d) => d.grupo_id === g.id)
    })
    return mapa
  }, [grupos, duplas])

  const preview = useMemo(() => {
    if (!quadras.length) return []
    const confrontos = gerarConfrontosDeGrupos(duplasPorGrupo)
    const baseInicio = campeonato.horario_base || new Date().toISOString()
    return distribuirNasQuadras(confrontos, quadras, {
      baseInicio,
      tempoJogoMin: campeonato.tempo_jogo_min,
      intervaloMin: campeonato.intervalo_min,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplasPorGrupo, quadras, campeonato, versao])

  const semDuplasSuficientes = Object.values(duplasPorGrupo).every((arr) => arr.length < 2)
  const naoAlocadas = duplas.filter((d) => !d.grupo_id).length

  const porQuadra = quadras.map((q) => ({
    quadra: q,
    jogos: preview.filter((j) => j.quadraId === q.id).sort((a, b) => a.ordem - b.ordem),
  }))

  async function confirmar() {
    setErro(null)
    if (preview.length === 0) {
      setErro('Nenhum confronto pra gerar — confira se as duplas foram divididas nos grupos.')
      return
    }
    setConfirmando(true)

    const linhas = preview.map((j) => ({
      campeonato_id: campeonato.id,
      fase: 'grupo',
      grupo_id: j.grupoId,
      quadra_id: j.quadraId,
      dupla1_id: j.dupla1.id,
      dupla2_id: j.dupla2.id,
      status: 'agendado',
      horario_previsto: j.horarioPrevisto.toISOString(),
      ordem: j.ordem,
    }))

    // limpa jogos de grupo gerados antes (caso o admin volte e gere de novo)
    await supabase.from('jogos').delete().eq('campeonato_id', campeonato.id).eq('fase', 'grupo')

    const { error } = await supabase.from('jogos').insert(linhas)
    if (error) {
      setErro('Não deu pra criar os jogos: ' + error.message)
      setConfirmando(false)
      return
    }

    await supabase.from('campeonatos').update({ status: 'em_andamento', etapa_cadastro: 4 }).eq('id', campeonato.id)
    setConfirmando(false)
    onConcluir()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      {naoAlocadas > 0 && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-3.5 text-[12.5px] text-gold">
          {naoAlocadas} dupla(s) sem grupo — elas não entram nos confrontos gerados.
        </div>
      )}

      {semDuplasSuficientes ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Nenhum grupo tem duplas suficientes pra gerar confrontos ainda. Volte e complete o chaveamento.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {porQuadra.map(({ quadra, jogos }) => (
              <div key={quadra.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-3 font-display text-xs uppercase tracking-wide text-muted">
                  Quadra {quadra.numero} · {jogos.length} jogos
                </div>
                <div className="flex flex-col gap-2.5">
                  {jogos.map((j, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 border-b border-border pb-2.5 text-[12.5px] last:border-0">
                      <span className="min-w-0 truncate">
                        <span className="mr-1.5 font-mono text-faint">{nomeGrupo(grupos, j.grupoId)}</span>
                        {j.dupla1.atleta1_apelido} &amp; {j.dupla1.atleta2_apelido}
                        <span className="px-1 text-faint">×</span>
                        {j.dupla2.atleta1_apelido} &amp; {j.dupla2.atleta2_apelido}
                      </span>
                      <span className="shrink-0 font-mono text-muted">{formatarHorario(j.horarioPrevisto.toISOString())}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center text-[11px] text-faint">
            Horários são uma estimativa — se recalculam sozinhos conforme os jogos acontecem.
          </div>
        </div>
      )}

      {erro && <div className="text-[12.5px] text-red-400">{erro}</div>}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <div className="flex gap-3">
          <button onClick={onVoltar} className="btn-ghost">
            Voltar
          </button>
          <button onClick={() => setVersao((v) => v + 1)} className="btn-ghost">
            Gerar novamente
          </button>
        </div>
        <button onClick={confirmar} disabled={confirmando || semDuplasSuficientes} className="btn-primary">
          {confirmando ? 'Criando jogos…' : 'Confirmar e iniciar campeonato'}
        </button>
      </div>
    </div>
  )
}
