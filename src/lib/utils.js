export function nomeQuadra(quadras, id) {
  const q = quadras.find((q) => q.id === id)
  return q ? `Quadra ${q.numero}` : '—'
}

export function nomeGrupo(grupos, id) {
  return grupos.find((g) => g.id === id)?.nome || null
}

export function duplaPorId(duplas, id) {
  return duplas.find((d) => d.id === id) || null
}

export function formatarHorario(iso) {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
