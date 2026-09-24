import { useCampeonatos } from '../lib/useCampeonato'
import { supabase } from '../lib/supabase'

const STATUS_LABEL = {
  cadastro: 'Em cadastro',
  em_andamento: 'Ao vivo',
  finalizado: 'Finalizado',
}

export default function CampeonatosList({ onAbrir }) {
  const { campeonatos, loading, refetch } = useCampeonatos()

  async function novoCampeonato() {
    const { data } = await supabase
      .from('campeonatos')
      .insert({ nome: 'Novo campeonato', status: 'cadastro', etapa_cadastro: 1 })
      .select()
      .single()
    if (data) onAbrir(data.id)
  }

  async function finalizarCampeonato(id) {
    await supabase.from('campeonatos').update({ status: 'finalizado' }).eq('id', id)
    refetch()
  }

  async function reabrirCampeonato(id) {
    await supabase.from('campeonatos').update({ status: 'em_andamento' }).eq('id', id)
    refetch()
  }

  if (loading) return <div className="py-16 text-center text-sm text-muted">Carregando…</div>

  return (
    <div className="flex flex-col gap-4">
      <button onClick={novoCampeonato} className="btn-primary">
        + Novo campeonato
      </button>

      {campeonatos.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          Nenhum campeonato criado ainda.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {campeonatos.map((c) => (
          <div
            key={c.id}
            className={`rounded-2xl border p-5 ${
              c.status === 'em_andamento' ? 'border-pinkdeep bg-gradient-to-br from-surface2 to-surface' : 'border-border bg-surface'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-display text-lg tracking-wide">{c.nome}</div>
                {c.categoria && <div className="text-xs text-muted">{c.categoria}</div>}
              </div>
              <Badge status={c.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-faint">
              {c.data && <span>{new Date(c.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
              {c.local && <span>{c.local}</span>}
              {c.num_duplas && <span>{c.num_duplas} duplas</span>}
              {c.num_quadras && <span>{c.num_quadras} quadras</span>}
            </div>

            <div className="mt-4 flex gap-2">
              {c.status === 'cadastro' && (
                <button onClick={() => onAbrir(c.id)} className="btn-primary">
                  Continuar cadastro
                </button>
              )}
              {c.status === 'em_andamento' && (
                <>
                  <button onClick={() => onAbrir(c.id)} className="btn-primary">
                    Abrir painel
                  </button>
                  <button onClick={() => finalizarCampeonato(c.id)} className="btn-ghost">
                    Finalizar
                  </button>
                </>
              )}
              {c.status === 'finalizado' && (
                <>
                  <button onClick={() => onAbrir(c.id)} className="btn-ghost">
                    Ver resultado
                  </button>
                  <button onClick={() => reabrirCampeonato(c.id)} className="btn-ghost">
                    Reabrir
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Badge({ status }) {
  const cores = {
    cadastro: 'bg-surface2 text-muted',
    em_andamento: 'bg-live/15 text-live',
    finalizado: 'bg-gold/15 text-gold',
  }
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${cores[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
