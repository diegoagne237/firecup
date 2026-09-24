// Motor de agendamento dos jogos de grupo.
//
// Regras (definidas com o Diego):
// - Dentro de cada grupo, todos jogam contra todos (round robin, método do círculo).
// - Os confrontos de todos os grupos são intercalados por "rodada" e distribuídos
//   nas quadras em round-robin, pra ocupar as quadras de forma equilibrada.
// - horario_previsto de cada jogo é uma ESTIMATIVA: base + posição-na-fila-da-quadra
//   × (tempo_jogo_min + intervalo_min).
// - Sempre que um jogo é iniciado ou finalizado, a fila da quadra é recalculada a
//   partir daquele momento real, empurrando os jogos seguintes daquela quadra.

// Gera as rodadas de round-robin de um grupo (método do círculo).
// Com número ímpar de duplas, uma fica de fora ("bye") em cada rodada.
function rodadasRoundRobin(duplas) {
  const lista = duplas.slice()
  if (lista.length < 2) return []
  if (lista.length % 2 !== 0) lista.push(null) // bye
  const n = lista.length
  const rodadas = []
  const fixo = lista[0]
  let resto = lista.slice(1)

  for (let r = 0; r < n - 1; r++) {
    const roda = [fixo, ...resto]
    const jogosDaRodada = []
    for (let i = 0; i < n / 2; i++) {
      const a = roda[i]
      const b = roda[n - 1 - i]
      if (a && b) jogosDaRodada.push([a, b])
    }
    rodadas.push(jogosDaRodada)
    // rotaciona mantendo o primeiro fixo
    resto = [resto[resto.length - 1], ...resto.slice(0, resto.length - 1)]
  }
  return rodadas
}

// duplasPorGrupo: { grupoId: [dupla, ...] }
// Retorna a lista de confrontos [{ grupoId, dupla1, dupla2 }] já intercalados
// por rodada entre os grupos, na ordem em que devem ser distribuídos nas quadras.
export function gerarConfrontosDeGrupos(duplasPorGrupo) {
  const rodadasPorGrupo = {}
  let maxRodadas = 0
  for (const [grupoId, duplas] of Object.entries(duplasPorGrupo)) {
    const rodadas = rodadasRoundRobin(duplas)
    rodadasPorGrupo[grupoId] = rodadas
    maxRodadas = Math.max(maxRodadas, rodadas.length)
  }

  const confrontos = []
  for (let r = 0; r < maxRodadas; r++) {
    for (const grupoId of Object.keys(duplasPorGrupo)) {
      const rodada = rodadasPorGrupo[grupoId][r]
      if (!rodada) continue
      rodada.forEach(([dupla1, dupla2]) => {
        confrontos.push({ grupoId, dupla1, dupla2 })
      })
    }
  }
  return confrontos
}

// Distribui os confrontos nas quadras (round-robin) e calcula o horário
// previsto inicial de cada jogo com base na posição na fila daquela quadra.
// quadras: [{ id, numero }, ...] já ordenadas
// Retorna: [{ grupoId, dupla1, dupla2, quadraId, ordem, horarioPrevisto }]
export function distribuirNasQuadras(confrontos, quadras, { baseInicio, tempoJogoMin, intervaloMin }) {
  const passoMs = (tempoJogoMin + intervaloMin) * 60 * 1000
  const filas = quadras.map(() => 0) // contador de jogos já colocados em cada quadra

  return confrontos.map((c, idx) => {
    const qIdx = idx % quadras.length
    const ordem = filas[qIdx]
    filas[qIdx] += 1
    const horarioPrevisto = new Date(new Date(baseInicio).getTime() + ordem * passoMs)
    return {
      ...c,
      quadraId: quadras[qIdx].id,
      ordem,
      horarioPrevisto,
    }
  })
}

// Recalcula a fila de jogos "agendado" de UMA quadra a partir de um horário
// âncora (o momento real que acabamos de descobrir: início ou fim de um jogo).
// jogosAgendadosDaQuadra: já ordenados por `ordem`, todos com status 'agendado'.
// Retorna [{ id, horario_previsto }] pronto pra fazer update em lote no Supabase.
export function recalcularFilaQuadra(jogosAgendadosDaQuadra, ancoraISO, tempoJogoMin, intervaloMin) {
  const passoMs = (tempoJogoMin + intervaloMin) * 60 * 1000
  let horario = new Date(ancoraISO).getTime()
  const atualizacoes = []
  jogosAgendadosDaQuadra.forEach((jogo, i) => {
    if (i > 0) horario += passoMs
    atualizacoes.push({ id: jogo.id, horario_previsto: new Date(horario).toISOString() })
  })
  return atualizacoes
}

export const NIVEIS = ['F1', 'F2', 'F3', 'F4', 'F5', 'PR']
