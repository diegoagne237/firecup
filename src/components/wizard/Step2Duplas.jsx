import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { NIVEIS } from '../../lib/scheduling'
import DuplaChip from '../DuplaChip'

const ATLETA_VAZIO = { nome: '', apelido: '', nivel: '' }

export default function Step2Duplas({ campeonato, duplas, onVoltar, onAvancar, refetch }) {
  const [mostrarNivel, setMostrarNivel] = useState(campeonato.mostrar_nivel)
  const [atleta1, setAtleta1] = useState(ATLETA_VAZIO)
  const [atleta2, setAtleta2] = useState(ATLETA_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  async function toggleMostrarNivel(valor) {
    setMostrarNivel(valor)
    await supabase.from('campeonatos').update({ mostrar_nivel: valor }).eq('id', campeonato.id)
  }

  async function adicionarDupla(e) {
    e.preventDefault()
    setErro(null)
    if (!atleta1.nome.trim() || !atleta1.apelido.trim() || !atleta2.nome.trim() || !atleta2.apelido.trim()) {
      setErro('Preenche nome e apelido dos dois atletas.')
      return
    }
    setSalvando(true)
    const { error } = await supabase.from('duplas').insert({
      campeonato_id: campeonato.id,
      atleta1_nome: atleta1.nome.trim(),
      atleta1_apelido: atleta1.apelido.trim(),
      atleta1_nivel: atleta1.nivel || null,
      atleta2_nome: atleta2.nome.trim(),
      atleta2_apelido: atleta2.apelido.trim(),
      atleta2_nivel: atleta2.nivel || null,
    })
    setSalvando(false)
    if (error) {
      setErro('Não deu pra salvar: ' + error.message)
      return
    }
    setAtleta1(ATLETA_VAZIO)
    setAtleta2(ATLETA_VAZIO)
    refetch()
  }

  async function removerDupla(id) {
    await supabase.from('duplas').delete().eq('id', id)
    refetch()
  }

  async function avancar() {
    await supabase.from('campeonatos').update({ etapa_cadastro: 3 }).eq('id', campeonato.id)
    onAvancar()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <div>
          <div className="text-[13px] font-bold">Mostrar nível ao público</div>
          <div className="text-[11.5px] text-faint">Tags F1–F5 / PR aparecem na visão pública das duplas</div>
        </div>
        <Toggle checked={mostrarNivel} onChange={toggleMostrarNivel} />
      </div>

      <form onSubmit={adicionarDupla} className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">Nova dupla</div>
        <div className="flex flex-col gap-4">
          <AtletaForm titulo="Atleta 1" valor={atleta1} onChange={setAtleta1} />
          <AtletaForm titulo="Atleta 2" valor={atleta2} onChange={setAtleta2} />
        </div>
        {erro && <div className="mt-3 text-[12.5px] text-red-400">{erro}</div>}
        <button type="submit" disabled={salvando} className="btn-primary mt-4">
          {salvando ? 'Adicionando…' : '+ Adicionar dupla'}
        </button>
      </form>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3.5 flex items-center justify-between text-[13px] font-bold uppercase tracking-wide text-muted">
          <span>Duplas cadastradas</span>
          <span className="font-mono normal-case text-text">
            {duplas.length}
            {campeonato.num_duplas ? ` / ${campeonato.num_duplas}` : ''}
          </span>
        </div>
        {duplas.length === 0 && <div className="text-sm text-muted">Nenhuma dupla cadastrada ainda.</div>}
        <div className="flex flex-col gap-2.5">
          {duplas.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 border-b border-border pb-2.5 last:border-0 last:pb-0">
              <DuplaChip dupla={d} mostrarNivel={true} size="sm" />
              <button onClick={() => removerDupla(d.id)} className="shrink-0 text-[11px] text-faint underline">
                remover
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5">
        <button onClick={onVoltar} className="btn-ghost">
          Voltar
        </button>
        <button onClick={avancar} disabled={duplas.length < 2} className="btn-primary">
          Avançar · Chaveamento
        </button>
      </div>
    </div>
  )
}

function AtletaForm({ titulo, valor, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{titulo}</div>
      <input
        className="input"
        placeholder="Nome completo"
        value={valor.nome}
        onChange={(e) => onChange({ ...valor, nome: e.target.value })}
      />
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Apelido"
          value={valor.apelido}
          onChange={(e) => onChange({ ...valor, apelido: e.target.value })}
        />
        <select
          className="input w-24 shrink-0"
          value={valor.nivel}
          onChange={(e) => onChange({ ...valor, nivel: e.target.value })}
        >
          <option value="">Nível</option>
          {NIVEIS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-pink' : 'bg-surface2'}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
