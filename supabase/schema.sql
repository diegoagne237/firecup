-- ============================================
-- Schema: Fire Cup — Campeonato de Futevôlei
-- ============================================
-- Rode este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query).

-- Campeonato (permite reaproveitar o app pra futuras edições)
create table campeonatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  num_quadras int not null default 1,
  status text not null default 'cadastro' check (status in ('cadastro', 'em_andamento', 'finalizado')),
  created_at timestamptz not null default now()
);

-- Quadras do campeonato (geradas a partir de num_quadras, guardadas pra poder nomear/numerar)
create table quadras (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  numero int not null,
  nome text,
  unique (campeonato_id, numero)
);

-- Grupos (A, B, C, D)
create table grupos (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  nome text not null,
  unique (campeonato_id, nome)
);

-- Duplas
create table duplas (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  grupo_id uuid references grupos(id) on delete set null,
  nome text not null,
  jogador1 text not null,
  jogador2 text not null,
  eliminada boolean not null default false,
  created_at timestamptz not null default now()
);

-- Jogos (fase de grupos + mata-mata, tudo na mesma tabela)
create table jogos (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  fase text not null check (fase in ('grupo', 'quartas', 'semi', 'terceiro', 'final')),
  grupo_id uuid references grupos(id) on delete set null,
  quadra_id uuid references quadras(id) on delete set null,
  dupla1_id uuid references duplas(id) on delete set null,
  dupla2_id uuid references duplas(id) on delete set null,
  pontos_dupla1 int,
  pontos_dupla2 int,
  status text not null default 'agendado' check (status in ('agendado', 'em_andamento', 'finalizado')),
  horario timestamptz,
  ordem int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Índices úteis
-- ============================================
create index idx_jogos_campeonato_status on jogos(campeonato_id, status);
create index idx_jogos_quadra on jogos(quadra_id);
create index idx_duplas_grupo on duplas(grupo_id);

-- ============================================
-- RLS: leitura pública (visão sem login), escrita só autenticada (admin)
-- ============================================
alter table campeonatos enable row level security;
alter table quadras enable row level security;
alter table grupos enable row level security;
alter table duplas enable row level security;
alter table jogos enable row level security;

create policy "public read campeonatos" on campeonatos for select using (true);
create policy "public read quadras" on quadras for select using (true);
create policy "public read grupos" on grupos for select using (true);
create policy "public read duplas" on duplas for select using (true);
create policy "public read jogos" on jogos for select using (true);

create policy "admin write campeonatos" on campeonatos for all using (auth.role() = 'authenticated');
create policy "admin write quadras" on quadras for all using (auth.role() = 'authenticated');
create policy "admin write grupos" on grupos for all using (auth.role() = 'authenticated');
create policy "admin write duplas" on duplas for all using (auth.role() = 'authenticated');
create policy "admin write jogos" on jogos for all using (auth.role() = 'authenticated');

-- ============================================
-- Realtime: liga a tabela jogos e duplas pro app receber updates ao vivo
-- (no Supabase, isso também pode ser ativado por Database > Replication)
-- ============================================
alter publication supabase_realtime add table jogos;
alter publication supabase_realtime add table duplas;

-- ============================================
-- Dados de exemplo para testar (opcional — apague antes do campeonato real)
-- ============================================
insert into campeonatos (nome, num_quadras, status) values ('Fire Cup 2026', 2, 'em_andamento');
