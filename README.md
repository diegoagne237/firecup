# Fire Cup — Campeonato de Futevôlei

App para gerenciar o campeonato de futevôlei da escola: 16 duplas, 4 grupos de 4,
quartas → semi → final + disputa de 3º lugar. Visão pública sem login (mobile) +
painel admin com login para controlar jogos e lançar resultados.

Stack: React + Vite + Tailwind + Supabase + Vercel.

## 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** → **New query**, cole o conteúdo de `supabase/schema.sql` e rode.
   Isso cria as tabelas, a segurança (RLS), o realtime e já insere um campeonato de exemplo.
3. Vá em **Authentication → Users → Add user** e crie o login de quem vai administrar
   o campeonato (email + senha). É essa conta que faz login em `/admin`.
4. Vá em **Project Settings → API** e copie a **Project URL** e a **anon public key**.

## 2. Configurar o projeto localmente

```bash
npm install
cp .env.example .env
# cole a URL e a anon key do Supabase no .env
npm run dev
```

- Visão pública: `http://localhost:5173/`
- Painel admin: `http://localhost:5173/admin`

## 3. Deploy (Vercel)

1. Suba este repositório no GitHub.
2. Importe o repositório na Vercel (ele detecta Vite automaticamente).
3. Em **Settings → Environment Variables**, adicione `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` com os mesmos valores do `.env`.
4. Deploy.

O `vercel.json` já garante que `/admin` funcione certinho (SPA sem 404 ao dar refresh).

## O que já funciona

- Visão pública com 3 abas: **Ao Vivo** (mostra só quem está jogando, sem placar
  em tempo real), **Classificação** (por grupo, com V, PF, PS e saldo de pontos
  como critério de desempate) e **Chaveamento** (quartas/semi/3º lugar/final).
- Atualização em tempo real via Supabase Realtime — quando o admin salva um
  resultado, a visão pública atualiza sozinha, sem dar refresh.
- Painel admin com login (Supabase Auth): iniciar um jogo numa quadra e lançar
  o resultado só quando o jogo termina.

## Ainda não implementado (próximos passos)

- Cadastro de duplas pela interface (hoje precisa inserir direto no Supabase
  ou por uma tela futura em **Gestão**, que já está no layout como placeholder).
- Sorteio automático dos grupos.
- Geração automática do chaveamento do mata-mata a partir da classificação
  (hoje os jogos de quartas/semi/final precisam ser criados manualmente na
  tabela `jogos` depois que a fase de grupos termina).
- Configuração de quadras e horários pela interface.

Esses itens usam as mesmas tabelas do `schema.sql` — dá pra ligar a tela
quando fizer sentido para o andamento do campeonato.
