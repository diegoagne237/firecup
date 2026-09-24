-- ============================================
-- Schema: Fire Cup — Campeonato de Futevôlei (v2)
-- ============================================
-- Rode este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query).
-- Se você já rodou a v1 deste schema, rode antes: drop table if exists jogos, duplas, grupos, quadras, campeonatos cascade;

-- Campeonato (podem existir vários simultâneos — ex: categorias diferentes)
create table campeonatos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  data date,
  horario_base timestamptz,           -- horário de início previsto do 1º jogo
  local text,
  num_duplas int,
  num_quadras int not null default 1,
  num_grupos int,
  duplas_por_grupo int,               -- alvo informativo; grupos podem ficar desbalanceados
  tempo_jogo_min int not null default 15,
  intervalo_min int not null default 5,
  mostrar_nivel boolean not null default true,
  status text not null default 'cadastro' check (status in ('cadastro', 'em_andamento', 'finalizado')),
  etapa_cadastro int not null default 1,  -- 1..4, em qual etapa do wizard o cadastro parou
  created_at timestamptz not null default now()
);

-- Quadras do campeonato
create table quadras (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  numero int not null,
  descricao text,
  unique (campeonato_id, numero)
);

-- Grupos (A, B, C, D...)
create table grupos (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  nome text not null,
  unique (campeonato_id, nome)
);

-- Duplas — cada atleta com nome, apelido e nível (F1-F5 ou PR de professor)
create table duplas (
  id uuid primary key default gen_random_uuid(),
  campeonato_id uuid not null references campeonatos(id) on delete cascade,
  grupo_id uuid references grupos(id) on delete set null,
  atleta1_nome text not null,
  atleta1_apelido text not null,
  atleta1_nivel text check (atleta1_nivel in ('F1', 'F2', 'F3', 'F4', 'F5', 'PR')),
  atleta2_nome text not null,
  atleta2_apelido text not null,
  atleta2_nivel text check (atleta2_nivel in ('F1', 'F2', 'F3', 'F4', 'F5', 'PR')),
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
  horario_previsto timestamptz,     -- estimativa, recalculada dinamicamente
  horario_inicio_real timestamptz,  -- preenchido quando o admin clica "Iniciar"
  horario_fim_real timestamptz,     -- preenchido quando o admin lança o resultado
  ordem int,                        -- posição na fila da quadra (usado para reordenar estimativas)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Índices úteis
-- ============================================
create index idx_jogos_campeonato_status on jogos(campeonato_id, status);
create index idx_jogos_quadra_ordem on jogos(quadra_id, ordem);
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
-- Realtime: liga as tabelas pro app receber updates ao vivo
-- ============================================
alter publication supabase_realtime add table campeonatos;
alter publication supabase_realtime add table quadras;
alter publication supabase_realtime add table grupos;
alter publication supabase_realtime add table duplas;
alter publication supabase_realtime add table jogos;
