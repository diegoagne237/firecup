import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from './AdminLogin'
import AdminPainel from './AdminPainel'

export default function AdminView() {
  const [sessao, setSessao] = useState(undefined) // undefined = carregando

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (sessao === undefined) return null
  return sessao ? <AdminPainel /> : <AdminLogin />
}
