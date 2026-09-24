import NivelTag from './NivelTag'

// Exibe uma dupla: "Mel & Duda" com as tags de nível em cima (se mostrar_nivel
// estiver ligado no campeonato). Usado no admin (sempre mostra) e no público
// (respeita a config do campeonato).
export default function DuplaChip({ dupla, mostrarNivel = true, size = 'md' }) {
  if (!dupla) return <span className="text-faint">A definir</span>

  const textSize = size === 'lg' ? 'text-base' : size === 'sm' ? 'text-[13px]' : 'text-sm'

  return (
    <span className="inline-flex flex-col gap-1">
      {mostrarNivel && (dupla.atleta1_nivel || dupla.atleta2_nivel) && (
        <span className="flex gap-1">
          <NivelTag nivel={dupla.atleta1_nivel} />
          <NivelTag nivel={dupla.atleta2_nivel} />
        </span>
      )}
      <span className={`font-extrabold ${textSize}`}>
        {dupla.atleta1_apelido} <span className="text-faint font-semibold">&amp;</span> {dupla.atleta2_apelido}
      </span>
    </span>
  )
}
