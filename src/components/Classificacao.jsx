import { useState, useMemo } from 'react'
import { calcularClassificacao } from '../lib/useCampeonato'
import DuplaChip from './DuplaChip'

export default function Classificacao({ grupos, duplas, jogos, mostrarNivel }) {
  const [grupoAtivo, setGrupoAtivo] = useState(grupos[0]?.id)

  const linhas = useMemo(() => {
    if (!grupoAtivo) return []
    return calcularClassificacao(grupoAtivo, duplas, jogos)
  }, [grupoAtivo, duplas, jogos])

  if (!grupos.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm text-muted">
        Grupos ainda não foram sorteados.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {grupos.map((g) => (
          <button
            key={g.id}
            onClick={() => setGrupoAtivo(g.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
              grupoAtivo === g.id
                ? 'border-pink bg-pink text-white'
                : 'border-border bg-surface2 text-muted'
            }`}
          >
            {g.nome}
          </button>
        ))}
      </div>

      <table className="mt-3.5 w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border-b border-border pb-2 text-left font-bold uppercase tracking-wide text-faint">
              Dupla
            </th>
            {['J', 'V', 'PF', 'PS', 'SP'].map((h) => (
              <th key={h} className="border-b border-border pb-2 text-center font-bold uppercase tracking-wide text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {linhas.map((l, i) => (
            <tr key={l.dupla.id} className={i < 2 ? 'bg-pink/[0.03]' : ''}>
              <td className="border-b border-border py-3 font-body font-bold">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold ${
                      i < 2 ? 'bg-pink/20 text-pink' : 'bg-surface2 text-muted'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <DuplaChip dupla={l.dupla} mostrarNivel={mostrarNivel} size="sm" />
                </span>
              </td>
              <td className="border-b border-border py-3 text-center">{l.j}</td>
              <td className="border-b border-border py-3 text-center">{l.v}</td>
              <td className="border-b border-border py-3 text-center">{l.pf}</td>
              <td className="border-b border-border py-3 text-center">{l.ps}</td>
              <td
                className={`border-b border-border py-3 text-center ${
                  l.saldo >= 0 ? 'text-live' : 'text-red-400'
                }`}
              >
                {l.saldo > 0 ? '+' : ''}
                {l.saldo}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-faint">
        <i className="inline-block h-2.5 w-2.5 rounded-sm bg-pink/40" /> classifica para as quartas
      </div>
    </div>
  )
}
