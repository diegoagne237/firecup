import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { recalcularFilaQuadra } from '../../lib/scheduling'
import { duplaPorId, formatarHorario, nomeGrupo } from '../../lib/utils'
import DuplaChip from '../DuplaChip'

// Card de uma quadra no painel admin: mostra o jogo em andamento (com o fluxo
// de finalizar) ou o próximo jogo com botão de iniciar. O placar só existe
// quando o jogo termina — nunca é editado ao vivo.
export default function AdminQuadraCard({ quadra, jogos, duplas, grupos, campeonato, refetch }) {
  const daQuadra = jogos.filter((j) => j.quadra_id === quadra.id)
  const atual = daQuadra.find((j) => j.status === 'em_andamento')
  const agendados = daQuadra.filter((j) => j.status === 'agendado').sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  const proximo = agendados[0]

  async function iniciarJogo(jogo) {
    const agora = new Date()
    await supabase.from('jogos').update({ status: 'em_andamento', horario_inicio_real: agora.toISOString() }).eq('id', jogo.id)

    const restantes = agendados.filter((j) => j.id !== jogo.id)
    if (restantes.length) {
      const ancora = new Date(agora.getTime() + (campeonato.tempo_jogo_min + campeonato.intervalo_min) * 60000).toISOString()
      const atualizacoes = recalcularFilaQuadra(restantes, ancora, campeonato.tempo_jogo_min, campeonato.intervalo_min)
      await Promise.all(atualizacoes.map((u) => supabase.from('jogos').update({ horario_previsto: u.horario_previsto }).eq('id', u.id)))
    }
    refetch()
  }

  async function finalizarJogo(jogo, pontos1, pontos2) {
    const agora = new Date()
    await supabase
      .from('jogos')
      .update({
        status: 'finalizado',
        pontos_dupla1: pontos1,
        pontos_dupla2: pontos2,
        horario_fim_real: agora.toISOString(),
      })
      .eq('id', jogo.id)

    if (agendados.length) {
      const ancora = new Date(agora.getTime() + campeonato.intervalo_min * 60000).toISOString()
      const atualizacoes = recalcularFilaQuadra(agendados, ancora, campeonato.tempo_jogo_min, campeonato.intervalo_min)
      await Promise.all(atualizacoes.map((u) => supabase.from('jogos').update({ horario_previsto: u.horario_previsto }).eq('id', u.id)))
    }
    refetch()
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-sm tracking-wide">
          Quadra {quadra.numero}
          {quadra.descricao && <span className="ml-1.5 font-body text-xs font-normal text-faint">{quadra.descricao}</span>}
        </span>
      </div>

      {atual ? (
        <JogoAtual jogo={atual} duplas={duplas} grupos={grupos} onFinalizar={finalizarJogo} />
      ) : proximo ? (
        <JogoProximo jogo={proximo} duplas={duplas} grupos={grupos} onIniciar={iniciarJogo} />
      ) : (
        <div className="text-sm text-muted">Sem jogos pendentes nesta quadra.</div>
      )}
    </div>
  )
}

function JogoAtual({ jogo, duplas, grupos, onFinalizar }) {
  const [abrirResultado, setAbrirResultado] = useState(false)
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [salvando, setSalvando] = useState(false)
  const d1 = duplaPorId(duplas, jogo.dupla1_id)
  const d2 = duplaPorId(duplas, jogo.dupla2_id)

  async function confirmar() {
    if (p1 === '' || p2 === '') return
    setSalvando(true)
    await onFinalizar(jogo, Number(p1), Number(p2))
    setSalvando(false)
    setAbrirResultado(false)
    setP1('')
    setP2('')
  }

  return (
    <div>
      <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-live/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-live">
        <span className="h-1.5 w-1.5 rounded-full bg-live" /> Em andamento
      </div>
      <div className="text-[11px] text-faint">{nomeGrupo(grupos, jogo.grupo_id) || jogo.fase}</div>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <DuplaChip dupla={d1} mostrarNivel />
        <span className="font-display text-xs text-faint">VS</span>
        <div className="text-right">
          <DuplaChip dupla={d2} mostrarNivel />
        </div>
      </div>

      {!abrirResultado && (
        <button onClick={() => setAbrirResultado(true)} className="btn-primary mt-3.5">
          Finalizar jogo · lançar resultado
        </button>
      )}

      {abrirResultado && (
        <>
          <div className="mt-3.5 flex items-end justify-center gap-3.5 border-t border-border pt-3.5">
            <PlacarInput valor={p1} onChange={setP1} label={d1?.atleta1_apelido + ' & ' + d1?.atleta2_apelido} />
            <span className="pb-2 font-mono text-lg text-faint">×</span>
            <PlacarInput valor={p2} onChange={setP2} label={d2?.atleta1_apelido + ' & ' + d2?.atleta2_apelido} />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <button onClick={confirmar} disabled={salvando || p1 === '' || p2 === ''} className="btn-primary">
              {salvando ? 'Salvando…' : 'Confirmar resultado'}
            </button>
            <button onClick={() => setAbrirResultado(false)} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function JogoProximo({ jogo, duplas, grupos, onIniciar }) {
  const [iniciando, setIniciando] = useState(false)
  const d1 = duplaPorId(duplas, jogo.dupla1_id)
  const d2 = duplaPorId(duplas, jogo.dupla2_id)

  async function iniciar() {
    setIniciando(true)
    await onIniciar(jogo)
    setIniciando(false)
  }

  return (
    <div>
      <div className="text-[11px] text-faint">
        Próximo · {nomeGrupo(grupos, jogo.grupo_id) || jogo.fase} · previsto {formatarHorario(jogo.horario_previsto)}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[13.5px] font-bold">
          {d1?.atleta1_apelido} & {d1?.atleta2_apelido}
          <span className="px-1.5 text-faint">×</span>
          {d2?.atleta1_apelido} & {d2?.atleta2_apelido}
        </span>
        <button onClick={iniciar} disabled={iniciando} className="shrink-0 rounded-lg bg-pink px-3 py-2 text-[12px] font-bold text-white">
          {iniciando ? '…' : 'Iniciar'}
        </button>
      </div>
    </div>
  )
}

function PlacarInput({ valor, onChange, label }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <input
        type="number"
        min="0"
        max="18"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-16 rounded-lg border border-border bg-surface2 py-2 text-center font-mono text-[22px] font-bold text-text outline-none focus:ring-2 focus:ring-pink"
      />
      <label className="max-w-[90px] text-center text-[11px] text-faint">{label}</label>
    </div>
  )
}
