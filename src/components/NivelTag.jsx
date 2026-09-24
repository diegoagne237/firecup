// Tag de nível do atleta (F1–F5 ou PR de professor).
// PR ganha uma cor própria pra se destacar dos níveis numéricos.
export default function NivelTag({ nivel }) {
  if (!nivel) return null
  const isProf = nivel === 'PR'
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${
        isProf ? 'bg-gold/15 text-gold' : 'bg-pink/15 text-pink'
      }`}
    >
      {nivel}
    </span>
  )
}
