import { useState } from 'react'
import PublicView from './components/PublicView'
import AdminView from './components/AdminView'
import ErrorBoundary from './components/ErrorBoundary'

// Rota simples: acessa /admin para a área de gestão, ou / para a visão pública.
// (Sem react-router por enquanto — dá pra trocar depois se o projeto crescer.)
const ehRotaAdmin = window.location.pathname.startsWith('/admin')

export default function App() {
  const [modo] = useState(ehRotaAdmin ? 'admin' : 'publico')
  // Admin é pensado pra uso em computador (mais largo); o público continua
  // mobile-first, já que é isso que o pessoal vai abrir no celular.
  const largura = modo === 'admin' ? 'max-w-6xl' : 'max-w-[480px]'

  return (
    <div className={`mx-auto flex min-h-full ${largura} flex-col gap-6 px-5 pb-16 pt-7 sm:px-8`}>
      <header className="flex flex-col items-center gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] drop-shadow-[0_0_8px_rgba(255,106,26,0.35)]">🔥</span>
          <h1 className="font-display text-[26px] tracking-wide">
            FIRE<span className="text-pink"> CUP</span>
          </h1>
        </div>
        <div className="text-[12.5px] uppercase tracking-[1.6px] text-muted">
          Campeonato de Futevôlei
        </div>
      </header>

      <ErrorBoundary>{modo === 'admin' ? <AdminView /> : <PublicView />}</ErrorBoundary>
    </div>
  )
}
