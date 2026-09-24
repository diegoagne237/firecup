import { useState } from 'react'
import { supabase } from '../../lib/supabase'

function horarioParaInput(iso) {
  if (!iso) return { data: '', hora: '' }
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    data: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export default function Step1DadosGerais({ campeonato, quadras, onAvancar }) {
  const inicial = horarioParaInput(campeonato.horario_base)
  const [form, setForm] = useState({
    nome: campeonato.nome || '',
    categoria: campeonato.categoria || '',
    data: campeonato.data || inicial.data,
    hora: inicial.hora,
    local: campeonato.local || '',
    num_duplas: campeonato.num_duplas || 16,
    num_quadras: campeonato.num_quadras || 2,
    num_grupos: campeonato.num_grupos || 4,
    duplas_por_grupo: campeonato.duplas_por_grupo || 4,
    tempo_jogo_min: campeonato.tempo_jogo_min || 15,
    intervalo_min: campeonato.intervalo_min || 5,
  })
  const [descricoesQuadra, setDescricoesQuadra] = useState(() => {
    const base = {}
    quadras.forEach((q) => {
      base[q.numero] = q.descricao || ''
    })
    return base
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function salvarEAvancar(e) {
    e.preventDefault()
    setErro(null)

    if (!form.nome.trim()) return setErro('Dá um nome pro campeonato.')
    if (form.num_quadras < 1) return setErro('Precisa de pelo menos 1 quadra.')
    if (form.num_grupos < 1) return setErro('Precisa de pelo menos 1 grupo.')

    setSalvando(true)

    const horarioBase = form.data && form.hora ? new Date(`${form.data}T${form.hora}:00`).toISOString() : null

    const { error: erroCamp } = await supabase
      .from('campeonatos')
      .update({
        nome: form.nome.trim(),
        categoria: form.categoria.trim() || null,
        data: form.data || null,
        horario_base: horarioBase,
        local: form.local.trim() || null,
        num_duplas: Number(form.num_duplas),
        num_quadras: Number(form.num_quadras),
        num_grupos: Number(form.num_grupos),
        duplas_por_grupo: Number(form.duplas_por_grupo),
        tempo_jogo_min: Number(form.tempo_jogo_min),
        intervalo_min: Number(form.intervalo_min),
        etapa_cadastro: 2,
      })
      .eq('id', campeonato.id)

    if (erroCamp) {
      setErro('Não deu pra salvar: ' + erroCamp.message)
      setSalvando(false)
      return
    }

    // sincroniza quadras (cria as que faltam, atualiza descrição das existentes)
    const numQuadras = Number(form.num_quadras)
    for (let n = 1; n <= numQuadras; n++) {
      await supabase.from('quadras').upsert(
        { campeonato_id: campeonato.id, numero: n, descricao: descricoesQuadra[n] || null },
        { onConflict: 'campeonato_id,numero' }
      )
    }
    // remove quadras a mais, se o número foi reduzido
    await supabase.from('quadras').delete().eq('campeonato_id', campeonato.id).gt('numero', numQuadras)

    // sincroniza grupos (Grupo A, B, C...)
    const numGrupos = Number(form.num_grupos)
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let n = 0; n < numGrupos; n++) {
      await supabase
        .from('grupos')
        .upsert({ campeonato_id: campeonato.id, nome: `Grupo ${letras[n]}` }, { onConflict: 'campeonato_id,nome' })
    }
    // remove grupos a mais
    const { data: gruposAtuais } = await supabase.from('grupos').select('id, nome').eq('campeonato_id', campeonato.id)
    const manterNomes = Array.from({ length: numGrupos }, (_, i) => `Grupo ${letras[i]}`)
    const paraRemover = (gruposAtuais || []).filter((g) => !manterNomes.includes(g.nome))
    for (const g of paraRemover) {
      await supabase.from('duplas').update({ grupo_id: null }).eq('grupo_id', g.id)
      await supabase.from('grupos').delete().eq('id', g.id)
    }

    setSalvando(false)
    onAvancar()
  }

  return (
    <form onSubmit={salvarEAvancar} className="flex flex-col gap-4">
      <Secao titulo="Sobre o campeonato">
        <Campo label="Nome do campeonato">
          <input className="input" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Fire Cup Outubro" />
        </Campo>
        <Campo label="Categoria (opcional)">
          <input
            className="input"
            value={form.categoria}
            onChange={(e) => set('categoria', e.target.value)}
            placeholder="Iniciante, Intermediário..."
          />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Data">
            <input type="date" className="input" value={form.data} onChange={(e) => set('data', e.target.value)} />
          </Campo>
          <Campo label="Horário de início">
            <input type="time" className="input" value={form.hora} onChange={(e) => set('hora', e.target.value)} />
          </Campo>
        </div>
        <Campo label="Local">
          <input className="input" value={form.local} onChange={(e) => set('local', e.target.value)} placeholder="Beach Way Sports" />
        </Campo>
      </Secao>

      <Secao titulo="Formato">
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Número de duplas">
            <input type="number" min="2" className="input" value={form.num_duplas} onChange={(e) => set('num_duplas', e.target.value)} />
          </Campo>
          <Campo label="Número de grupos">
            <input type="number" min="1" className="input" value={form.num_grupos} onChange={(e) => set('num_grupos', e.target.value)} />
          </Campo>
          <Campo label="Duplas por grupo (alvo)">
            <input
              type="number"
              min="2"
              className="input"
              value={form.duplas_por_grupo}
              onChange={(e) => set('duplas_por_grupo', e.target.value)}
            />
          </Campo>
          <Campo label="Tempo de jogo (min)">
            <input
              type="number"
              min="1"
              className="input"
              value={form.tempo_jogo_min}
              onChange={(e) => set('tempo_jogo_min', e.target.value)}
            />
          </Campo>
        </div>
        <Campo label="Intervalo entre jogos na mesma quadra (min)">
          <input type="number" min="0" className="input" value={form.intervalo_min} onChange={(e) => set('intervalo_min', e.target.value)} />
        </Campo>
      </Secao>

      <Secao titulo="Quadras">
        <Campo label="Número de quadras">
          <input type="number" min="1" className="input" value={form.num_quadras} onChange={(e) => set('num_quadras', e.target.value)} />
        </Campo>
        <div className="flex flex-col gap-2">
          {Array.from({ length: Number(form.num_quadras) || 0 }, (_, i) => i + 1).map((n) => (
            <Campo key={n} label={`Descrição da Quadra ${n} (opcional)`}>
              <input
                className="input"
                value={descricoesQuadra[n] || ''}
                onChange={(e) => setDescricoesQuadra((d) => ({ ...d, [n]: e.target.value }))}
                placeholder="Ex: Quadra central, coberta"
              />
            </Campo>
          ))}
        </div>
      </Secao>

      {erro && <div className="text-[12.5px] text-red-400">{erro}</div>}

      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? 'Salvando…' : 'Avançar · Cadastrar duplas'}
      </button>
    </form>
  )
}

function Secao({ titulo, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">{titulo}</div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-bold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  )
}
