import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

// Carrega o campeonato ativo (ou o mais recente) e mantém tudo sincronizado
// em tempo real via Supabase Realtime, sem precisar dar refresh na página.
export function useCampeonato() {
  const [campeonato, setCampeonato] = useState(null)
  const [quadras, setQuadras] = useState([])
  const [grupos, setGrupos] = useState([])
  const [duplas, setDuplas] = useState([])
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  const carregarTudo = useCallback(async (campeonatoId) => {
    const [{ data: q }, { data: g }, { data: d }, { data: j }] = await Promise.all([
      supabase.from('quadras').select('*').eq('campeonato_id', campeonatoId).order('numero'),
      supabase.from('grupos').select('*').eq('campeonato_id', campeonatoId).order('nome'),
      supabase.from('duplas').select('*').eq('campeonato_id', campeonatoId).order('nome'),
      supabase
        .from('jogos')
        .select('*')
        .eq('campeonato_id', campeonatoId)
        .order('ordem', { ascending: true, nullsFirst: true }),
    ])
    setQuadras(q || [])
    setGrupos(g || [])
    setDuplas(d || [])
    setJogos(j || [])
  }, [])

  useEffect(() => {
    let canal

    async function init() {
      setLoading(true)
      // pega o campeonato em andamento; se não houver, pega o mais recente
      let { data: ativo, error: e1 } = await supabase
        .from('campeonatos')
        .select('*')
        .eq('status', 'em_andamento')
        .limit(1)
        .maybeSingle()

      if (!ativo && !e1) {
        const { data: recente } = await supabase
          .from('campeonatos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        ativo = recente
      }

      if (!ativo) {
        setErro('Nenhum campeonato cadastrado ainda.')
        setLoading(false)
        return
      }

      setCampeonato(ativo)
      await carregarTudo(ativo.id)
      setLoading(false)

      // Realtime: qualquer mudança em jogos deste campeonato atualiza a tela na hora
      canal = supabase
        .channel(`campeonato-${ativo.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'jogos', filter: `campeonato_id=eq.${ativo.id}` },
          () => carregarTudo(ativo.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'duplas', filter: `campeonato_id=eq.${ativo.id}` },
          () => carregarTudo(ativo.id)
        )
        .subscribe()
    }

    init()

    return () => {
      if (canal) supabase.removeChannel(canal)
    }
  }, [carregarTudo])

  const refetch = useCallback(() => {
    if (campeonato) carregarTudo(campeonato.id)
  }, [campeonato, carregarTudo])

  return { campeonato, quadras, grupos, duplas, jogos, loading, erro, refetch }
}

// Calcula a classificação de um grupo a partir dos jogos finalizados,
// espelhando a view `classificacao_grupos` do banco (V, PF, PS, saldo de pontos).
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
