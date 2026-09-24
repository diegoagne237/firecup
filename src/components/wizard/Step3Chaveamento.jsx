import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import DuplaChip from '../DuplaChip'

// Arrastar funciona em desktop (HTML5 drag and drop). Em tablet/celular nem
// sempre é confiável, então também dá pra "clicar pra selecionar, clicar pro
// grupo pra soltar" — as duas formas fazem a mesma chamada no banco.
export default function Step3Chaveamento({ campeonato, grupos, duplas, onVoltar, onAvancar }) {
  const [selecionada, setSelecionada] = useState(null)

  const semGrupo = duplas.filter((d) => !d.grupo_id)

  async function atribuir(duplaId, grupoId) {
    await supabase.from('duplas').update({ grupo_id: grupoId }).eq('id', duplaId)
    setSelecionada(null)
  }

  function onDragStart(e, duplaId) {
    e.dataTransfer.setData('text/plain', duplaId)
  }
  function onDrop(e, grupoId) {
    e.preventDefault()
    const duplaId = e.dataTransfer.getData('text/plain')
    if (duplaId) atribuir(duplaId, grupoId)
  }
  function onDragOver(e) {
    e.preventDefault()
  }

  function onClickDupla(duplaId) {
    setSelecionada((atual) => (atual === duplaId ? null : duplaId))
  }
  function onClickZona(grupoId) {
    if (selecionada) atribuir(selecionada, grupoId)
  }

  async function avancar() {
    await supabase.from('campeonatos').update({ etapa_cadastro: 4 }).eq('id', campeonato.id)
    onAvancar()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[12.5px] text-muted">
        Arraste cada dupla pro grupo dela (ou toque na dupla e depois no grupo). Grupos podem ficar com números
        diferentes de duplas — sem problema.
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, null)}
        onClick={() => onClickZona(null)}
        className="rounded-2xl border border-dashed border-border bg-surface p-4"
      >
        <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-faint">
          Sem grupo · {semGrupo.length}
        </div>
        <div className="flex flex-wrap gap-2">
          {semGrupo.length === 0 && <span className="text-sm text-muted">Todas as duplas já têm grupo.</span>}
          {semGrupo.map((d) => (
            <CardDupla key={d.id} dupla={d} selecionada={selecionada === d.id} onDragStart={onDragStart} onClick={onClickDupla} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {grupos.map((g) => {
          const daqui = duplas.filter((d) => d.grupo_id === g.id)
          return (
            <div
              key={g.id}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, g.id)}
              onClick={() => onClickZona(g.id)}
              className="min-h-[120px] rounded-2xl border border-border bg-surface2 p-3.5"
            >
              <div className="mb-2.5 font-display text-xs uppercase tracking-wide text-muted">
                {g.nome} · {daqui.length}
              </div>
              <div className="flex flex-col gap-1.5">
                {daqui.map((d) => (
                  <CardDupla key={d.id} dupla={d} selecionada={selecionada === d.id} onDragStart={onDragStart} onClick={onClickDupla} compact />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2.5">
        <button onClick={onVoltar} className="btn-ghost">
          Voltar
        </button>
        <button onClick={avancar} disabled={semGrupo.length === duplas.length && duplas.length > 0} className="btn-primary">
          Avançar · Gerar jogos
        </button>
      </div>
    </div>
  )
}

function CardDupla({ dupla, selecionada, onDragStart, onClick, compact }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, dupla.id)}
      onClick={(e) => {
        e.stopPropagation()
        onClick(dupla.id)
      }}
      className={`cursor-grab rounded-lg border px-2.5 py-2 active:cursor-grabbing ${
        selecionada ? 'border-pink bg-pink/10' : 'border-border bg-surface'
      } ${compact ? '' : ''}`}
    >
      <DuplaChip dupla={dupla} mostrarNivel={true} size="sm" />
    </div>
  )
}
