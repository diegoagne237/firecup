# Fire Cup — Campeonato de Futevôlei

App para gerenciar campeonatos de futevôlei da escola: cadastro completo (dados
gerais, duplas, chaveamento por grupos, geração dos jogos), painel admin ao
vivo com reagendamento automático de horários, e visão pública sem login.

Stack: React + Vite + Tailwind + Supabase + Vercel.

## ⚠️ Atualização de schema (v2)

O banco mudou bastante nessa versão (duplas viraram atleta1/atleta2 com nome +
apelido + nível, campeonato ganhou vários campos novos, jogos ganharam
horário previsto/real). Se você já rodou a v1 do `schema.sql`, **apague as
tabelas antes de rodar a nova versão**:

```sql
drop table if exists jogos, duplas, grupos, quadras, campeonatos cascade;
```

Depois rode o `supabase/schema.sql` inteiro no SQL Editor do Supabase.

## 1. Configurar o Supabase

1. Rode `supabase/schema.sql` no SQL Editor (cria tabelas, RLS e realtime).
2. Em **Authentication → Users → Add user**, crie o login de quem administra
   (email + senha) — é essa conta que acessa `/admin`.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

## 2. Rodar localmente

```bash
npm install
cp .env.example .env
# cole VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env
npm run dev
```

- Visão pública: `http://localhost:5173/`
- Painel admin: `http://localhost:5173/admin`

## 3. Deploy (Vercel)

Importe o repositório, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
em **Settings → Environment Variables** e faça o deploy. O `vercel.json` já
garante que `/admin` funcione com refresh (SPA sem 404).

## Como funciona o cadastro de um campeonato

Pode haver mais de um campeonato simultâneo (ex: categorias diferentes rodando
no mesmo dia). Cada um passa por um wizard de 4 etapas:

1. **Dados gerais** — nome, categoria, data/horário, local, número de duplas,
   quadras (com descrição de cada uma), grupos, duplas por grupo, tempo de
   jogo e intervalo entre jogos na mesma quadra.
2. **Duplas** — cadastradas uma a uma, 1 atleta por vez (nome, apelido,
   nível F1–F5 ou PR de professor). Aparecem depois só pelo apelido
   ("Mel & Duda"). Tem um switch pra decidir se o nível aparece pro público.
3. **Chaveamento** — arraste cada dupla pro grupo dela (ou toque na dupla e
   depois no grupo, pra funcionar bem em tablet). Grupos podem ficar
   desbalanceados sem problema.
4. **Jogos** — gera os confrontos de todos-contra-todos de cada grupo,
   distribui nas quadras e calcula o horário previsto de cada um. Ao
   confirmar, o campeonato entra no ar.

Depois de criado, o campeonato aparece na lista inicial do admin com um botão
pra **Finalizar campeonato** quando ele acabar.

## Reagendamento automático dos horários

Os horários dos jogos são só uma estimativa, e o app reajusta sozinho quando a
realidade atrasa:

- Ao **iniciar** um jogo, a fila da quadra é recalculada a partir de
  `agora + tempo de jogo + intervalo`.
- Ao **finalizar** um jogo (lançar o placar), a fila é recalculada de novo a
  partir de `agora + intervalo` (mais preciso, porque já sabemos quando esse
  jogo realmente acabou).

Isso empurra os jogos seguintes daquela quadra em cadeia — só daquela quadra,
as outras não são afetadas. A lógica está isolada em `src/lib/scheduling.js`.

## Fases finais (quartas, semi, final e 3º lugar)

Não são geradas automaticamente — a organização adiciona cada confronto na
mão, na seção **Gestão → Fases finais** do painel admin, assim que decide os
cruzamentos a partir da classificação dos grupos.

## Ainda não implementado

- Edição de uma dupla já cadastrada (hoje dá pra remover e recadastrar).
- Reordenar manualmente a fila de jogos de uma quadra.
- Exportar resultados/súmula.

Esses itens usam as mesmas tabelas do `schema.sql` — dá pra ligar quando fizer
sentido.
