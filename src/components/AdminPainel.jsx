import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCampeonatos } from '../lib/useCampeonato'
import CampeonatosList from './CampeonatosList'
import CampeonatoWizard from './wizard/CampeonatoWizard'
import CampeonatoDashboard from './admin/CampeonatoDashboard'

// Roteador simples do admin: lista de campeonatos → wizard de cadastro
// (enquanto status = 'cadastro') → painel operacional (em_andamento / finalizado).
export default function AdminPainel() {
  const [abertoId, setAbertoId] = useState(null)
  const { campeonatos } = useCampeonatos()

  async function sair() {
    await supabase.auth.signOut()
  }

  if (!abertoId) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button onClick={sair} className="text-xs text-faint underline">
            sair
          </button>
        </div>
        <CampeonatosList onAbrir={setAbertoId} />
      </div>
    )
  }

  const campeonato = campeonatos.find((c) => c.id === abertoId)
  const emCadastro = campeonato ? campeonato.status === 'cadastro' : true

  return emCadastro ? (
    <CampeonatoWizard campeonatoId={abertoId} onVoltarLista={() => setAbertoId(null)} onConcluido={() => setAbertoId(abertoId)} />
  ) : (
    <CampeonatoDashboard campeonatoId={abertoId} onVoltarLista={() => setAbertoId(null)} />
  )
}
