-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  body_mass_kg numeric not null default 75,
  created_at timestamptz not null default now()
);

-- Fuel logs
create table if not exists fuel_logs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  game_week int not null,
  log_date date not null,
  day_label text not null check (day_label in ('MD','MD+1','MD+2','MD+3','MD+4','MD-2','MD-1')),
  cho_advised_g numeric,
  cho_actual_g numeric,
  pro_advised_g numeric,
  pro_actual_g numeric,
  fat_advised_g numeric,
  fat_actual_g numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- UEFA guidance (editable in-app)
create table if not exists uefa_guidance (
  id int primary key generated always as identity,
  label text not null,
  g_per_kg_low numeric,
  g_per_kg_high numeric,
  notes text
);

insert into uefa_guidance (label, g_per_kg_low, g_per_kg_high, notes)
values
('Daily CHO (heavy training / match prep)', 6, 8, 'Reference range used in elite football practice'),
('Pre-match meal (3–4h)', 1, 3, 'CHO per kg in pre-match meal window'),
('Post-match early recovery (per hour)', 1, null, 'Often expressed as ~1.0 g/kg/h; multiply by hours')
on conflict do nothing;
