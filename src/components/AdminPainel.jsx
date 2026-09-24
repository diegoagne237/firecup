import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCampeonato } from '../lib/useCampeonato'
import { nomeDupla, nomeQuadra, nomeGrupo } from './LiveMatch'

export default function AdminPainel() {
  const { campeonato, quadras, grupos, duplas, jogos, loading, erro, refetch } = useCampeonato()

  const jogoAoVivo = useMemo(() => jogos.find((j) => j.status === 'em_andamento'), [jogos])
  const proximos = useMemo(() => jogos.filter((j) => j.status === 'agendado'), [jogos])
  const finalizadosCount = jogos.filter((j) => j.status === 'finalizado').length

  async function sair() {
    await supabase.auth.signOut()
  }

  async function iniciarJogo(jogoId) {
    await supabase.from('jogos').update({ status: 'em_andamento' }).eq('id', jogoId)
    refetch()
  }

  if (loading) return <div className="py-16 text-center text-sm text-muted">Carregando…</div>
  if (erro) return <div className="py-16 text-center text-sm text-muted">{erro}</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          Campeonato: <b className="text-text">{campeonato?.nome}</b>
        </span>
        <button onClick={sair} className="text-xs text-faint underline">
          sair
        </button>
      </div>

      <div className="flex gap-2.5">
        <StatusPill label="Duplas" valor={duplas.length} />
        <StatusPill label="Quadras" valor={quadras.length} />
        <StatusPill label="Jogos feitos" valor={`${finalizadosCount}/${jogos.length}`} />
      </div>

      <FinalizarJogoCard jogo={jogoAoVivo} duplas={duplas} quadras={quadras} grupos={grupos} onSalvo={refetch} />

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">Próximos jogos</div>
        {proximos.length === 0 && <div className="text-sm text-muted">Nenhum jogo agendado.</div>}
        {proximos.map((j) => (
          <div key={j.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
            <span className="shrink-0 rounded-lg border border-border bg-surface2 px-1.5 py-1 text-center font-mono text-[11px] font-bold">
              {nomeQuadra(quadras, j.quadra_id).replace('Quadra ', 'Q')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold">
                {nomeDupla(duplas, j.dupla1_id)} × {nomeDupla(duplas, j.dupla2_id)}
              </div>
              <div className="font-mono text-[11px] text-faint">{nomeGrupo(grupos, j.grupo_id) || j.fase}</div>
            </div>
            <button
              onClick={() => iniciarJogo(j.id)}
              disabled={!!jogoAoVivo}
              className="shrink-0 rounded-lg bg-pink px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
              title={jogoAoVivo ? 'Finalize o jogo em andamento antes de iniciar outro' : 'Iniciar jogo'}
            >
              Iniciar
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">Gestão</div>
        <div className="flex flex-col gap-2">
          {['Cadastrar / editar duplas', 'Sortear grupos', 'Configurar quadras e horários', 'Gerar chaveamento do mata-mata'].map(
            (t) => (
              <button
                key={t}
                className="rounded-xl border border-border px-4 py-3 text-left text-[13.5px] font-bold text-muted"
              >
                {t} <span className="text-faint">· em breve</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ label, valor }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-surface2 px-1 py-2.5 text-center">
      <div className="text-[11px] font-extrabold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-mono text-[17px] font-bold">{valor}</div>
    </div>
  )
}

function FinalizarJogoCard({ jogo, duplas, quadras, grupos, onSalvo }) {
  const [abrirResultado, setAbrirResultado] = useState(false)
  const [pontos1, setPontos1] = useState('')
  const [pontos2, setPontos2] = useState('')
  const [salvando, setSalvando] = useState(false)

  if (!jogo) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm text-muted">
        Nenhum jogo em andamento. Inicie um jogo na lista abaixo.
      </div>
    )
  }

  async function confirmar() {
    if (pontos1 === '' || pontos2 === '') return
    setSalvando(true)
    await supabase
      .from('jogos')
      .update({
        pontos_dupla1: Number(pontos1),
        pontos_dupla2: Number(pontos2),
        status: 'finalizado',
      })
      .eq('id', jogo.id)
    setSalvando(false)
    setAbrirResultado(false)
    setPontos1('')
    setPontos2('')
    onSalvo()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-pinkdeep bg-gradient-to-br from-surface2 to-surface p-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-live/10 px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-live">
        <span className="h-1.5 w-1.5 rounded-full bg-live" />
        Jogo em andamento · {nomeQuadra(quadras, jogo.quadra_id)}
      </div>
      <div className="mt-2.5 text-xs text-muted">{nomeGrupo(grupos, jogo.grupo_id) || jogo.fase}</div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5">
        <div className="truncate text-base font-extrabold">{nomeDupla(duplas, jogo.dupla1_id)}</div>
        <div className="font-display text-sm text-faint">VS</div>
        <div className="truncate text-right text-base font-extrabold">{nomeDupla(duplas, jogo.dupla2_id)}</div>
      </div>

      {!abrirResultado && (
        <button
          onClick={() => setAbrirResultado(true)}
          className="mt-4 w-full rounded-xl bg-pink py-3.5 font-bold text-white"
        >
          Finalizar jogo · lançar resultado
        </button>
      )}

      {abrirResultado && (
        <>
          <div className="mt-4 flex items-end justify-center gap-4 border-t border-border pt-4">
            <div className="flex flex-col items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="18"
                value={pontos1}
                onChange={(e) => setPontos1(e.target.value)}
                placeholder="0"
                className="w-16 rounded-lg border border-border bg-surface2 py-2 text-center font-mono text-[22px] font-bold text-text outline-none focus:ring-2 focus:ring-pink"
              />
              <label className="max-w-[90px] text-center text-[11px] text-faint">
                {nomeDupla(duplas, jogo.dupla1_id)}
              </label>
            </div>
            <span className="pb-2 font-mono text-lg text-faint">×</span>
            <div className="flex flex-col items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="18"
                value={pontos2}
                onChange={(e) => setPontos2(e.target.value)}
                placeholder="0"
                className="w-16 rounded-lg border border-border bg-surface2 py-2 text-center font-mono text-[22px] font-bold text-text outline-none focus:ring-2 focus:ring-pink"
              />
              <label className="max-w-[90px] text-center text-[11px] text-faint">
                {nomeDupla(duplas, jogo.dupla2_id)}
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <button
              onClick={confirmar}
              disabled={salvando || pontos1 === '' || pontos2 === ''}
              className="w-full rounded-xl bg-pink py-3.5 font-bold text-white disabled:opacity-50"
            >
              {salvando ? 'Salvando…' : 'Confirmar resultado'}
            </button>
            <button
              onClick={() => setAbrirResultado(false)}
              className="w-full rounded-xl border border-border py-3.5 font-bold text-muted"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
