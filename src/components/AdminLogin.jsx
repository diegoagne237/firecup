import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setEnviando(false)
    if (error) setErro('Email ou senha incorretos.')
  }

  return (
    <form onSubmit={entrar} className="rounded-2xl border border-border bg-surface p-7 text-center">
      <span className="mb-1.5 block text-[34px]">🔥</span>
      <h2 className="font-display text-[19px] tracking-wide">ACESSO DA ORGANIZAÇÃO</h2>

      <div className="mt-4 flex flex-col gap-1.5 text-left">
        <label className="text-[11.5px] font-bold uppercase tracking-wide text-muted" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-surface2 px-3.5 py-3 text-text outline-none focus:ring-2 focus:ring-pink"
        />
      </div>

      <div className="mt-3.5 flex flex-col gap-1.5 text-left">
        <label className="text-[11.5px] font-bold uppercase tracking-wide text-muted" htmlFor="senha">
          Senha do campeonato
        </label>
        <input
          id="senha"
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="rounded-lg border border-border bg-surface2 px-3.5 py-3 font-mono tracking-widest text-text outline-none focus:ring-2 focus:ring-pink"
        />
      </div>

      {erro && <div className="mt-3 text-[12.5px] text-red-400">{erro}</div>}

      <button
        type="submit"
        disabled={enviando}
        className="mt-4 w-full rounded-xl bg-pink py-3.5 font-bold tracking-wide text-white active:bg-pinkdeep disabled:opacity-60"
      >
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>

      <div className="mt-3.5 text-[11px] text-faint">
        Acesso criado no Supabase Auth (Authentication → Users) para quem organiza o campeonato.
      </div>
    </form>
  )
}
