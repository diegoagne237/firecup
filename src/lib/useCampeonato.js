import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

// Lista todos os campeonatos (pode haver mais de um simultâneo — categorias
// diferentes). Usado na tela inicial do admin e no seletor da visão pública.
export function useCampeonatos() {
  const [campeonatos, setCampeonatos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const { data } = await supabase.from('campeonatos').select('*').order('created_at', { ascending: false })
    setCampeonatos(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
    // Nome do canal com sufixo único: evita colisão quando o efeito roda de
    // novo antes do canal anterior terminar de ser removido (o Supabase
    // recusa adicionar listeners num canal que já tem esse nome inscrito).
    const canal = supabase
      .channel(`campeonatos-lista-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campeonatos' }, carregar)
    try {
      canal.subscribe()
    } catch (e) {
      console.warn('Realtime indisponível para campeonatos:', e)
    }
    return () => supabase.removeChannel(canal)
  }, [carregar])

  return { campeonatos, loading, refetch: carregar }
}

// Carrega um campeonato específico (por id) com tudo em tempo real:
// quadras, grupos, duplas e jogos.
export function useCampeonato(campeonatoId) {
  const [campeonato, setCampeonato] = useState(null)
  const [quadras, setQuadras] = useState([])
  const [grupos, setGrupos] = useState([])
  const [duplas, setDuplas] = useState([])
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)

  const carregarTudo = useCallback(async (id) => {
    const [{ data: camp }, { data: q }, { data: g }, { data: d }, { data: j }] = await Promise.all([
      supabase.from('campeonatos').select('*').eq('id', id).maybeSingle(),
      supabase.from('quadras').select('*').eq('campeonato_id', id).order('numero'),
      supabase.from('grupos').select('*').eq('campeonato_id', id).order('nome'),
      supabase.from('duplas').select('*').eq('campeonato_id', id).order('created_at'),
      supabase.from('jogos').select('*').eq('campeonato_id', id).order('ordem', { ascending: true, nullsFirst: true }),
    ])
    setCampeonato(camp || null)
    setQuadras(q || [])
    setGrupos(g || [])
    setDuplas(d || [])
    setJogos(j || [])
  }, [])

  useEffect(() => {
    if (!campeonatoId) {
      setLoading(false)
      return
    }
    let canal
    setLoading(true)
    carregarTudo(campeonatoId).then(() => setLoading(false))

    canal = supabase
      .channel(`campeonato-${campeonatoId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jogos', filter: `campeonato_id=eq.${campeonatoId}` }, () =>
        carregarTudo(campeonatoId)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'duplas', filter: `campeonato_id=eq.${campeonatoId}` }, () =>
        carregarTudo(campeonatoId)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campeonatos', filter: `id=eq.${campeonatoId}` }, () =>
        carregarTudo(campeonatoId)
      )
    try {
      canal.subscribe()
    } catch (e) {
      console.warn('Realtime indisponível para este campeonato:', e)
    }

    return () => {
      if (canal) supabase.removeChannel(canal)
    }
  }, [campeonatoId, carregarTudo])

  const refetch = useCallback(() => {
    if (campeonatoId) carregarTudo(campeonatoId)
  }, [campeonatoId, carregarTudo])

  return { campeonato, quadras, grupos, duplas, jogos, loading, refetch }
}

// Nome de exibição da dupla, ex: "Mel & Duda"
export function nomeExibicaoDupla(dupla) {
  if (!dupla) return '—'
  return `${dupla.atleta1_apelido} & ${dupla.atleta2_apelido}`
}

// Calcula a classificação de um grupo a partir dos jogos finalizados
// (V, PF, PS, saldo de pontos como critério de desempate).
export function calcularClassificacao(grupoId, duplas, jogos) {
  const doGrupo = duplas.filter((d) => d.grupo_id === grupoId)
  const linhas = doGrupo.map((d) => ({ dupla: d, j: 0, v: 0, pf: 0, ps: 0 }))
  const porId = Object.fromEntries(linhas.map((l) => [l.dupla.id, l]))

  jogos
    .filter((j) => j.fase === 'grupo' && j.grupo_id === grupoId && j.status === 'finalizado')
    .forEach((j) => {
      const a = porId[j.dupla1_id]
      const b = porId[j.dupla2_id]
      if (!a || !b) return
      a.j += 1
      b.j += 1
      a.pf += j.pontos_dupla1
      a.ps += j.pontos_dupla2
      b.pf += j.pontos_dupla2
      b.ps += j.pontos_dupla1
      if (j.pontos_dupla1 > j.pontos_dupla2) a.v += 1
      else if (j.pontos_dupla2 > j.pontos_dupla1) b.v += 1
    })

  return linhas
    .map((l) => ({ ...l, saldo: l.pf - l.ps }))
    .sort((x, y) => y.v - x.v || y.saldo - x.saldo)
}
