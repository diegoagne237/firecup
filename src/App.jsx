import { useState } from 'react'
import PublicView from './components/PublicView'
import AdminView from './components/AdminView'

// Rota simples: acessa /admin para a área de gestão, ou / para a visão pública.
// (Sem react-router por enquanto — dá pra trocar depois se o projeto crescer.)
const ehRotaAdmin = window.location.pathname.startsWith('/admin')

export default function App() {
  const [modo] = useState(ehRotaAdmin ? 'admin' : 'publico')

  return (
    <div className="mx-auto flex min-h-full max-w-[480px] flex-col gap-5 px-4 pb-14 pt-6">
      <header className="flex flex-col items-center gap-1.5 pb-0.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] drop-shadow-[0_0_8px_rgba(255,47,126,0.35)]">🔥</span>
          <h1 className="font-display text-[26px] tracking-wide">
            FIRE<span className="text-pink"> CUP</span>
          </h1>
        </div>
        <div className="text-[12.5px] uppercase tracking-[1.6px] text-muted">
          Campeonato de Futevôlei
        </div>
      </header>

      {modo === 'admin' ? <AdminView /> : <PublicView />}

      <footer className="pt-1.5 text-center text-[10.5px] uppercase tracking-wide text-faint">
        A escola é <b className="text-gold">laranja &amp; preto</b> · a Fire Cup é rosa
      </footer>
    </div>
  )
}
