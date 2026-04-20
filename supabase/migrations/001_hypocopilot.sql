-- HypoCopilot: datos por usuario (Google sub = user_id)
-- Ejecutar en Supabase → SQL Editor (una vez)

create extension if not exists "pgcrypto";

create table if not exists hc_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  client_id text not null,
  date date not null,
  timestamp_ms bigint not null,
  type text not null,
  label text not null,
  value_json jsonb,
  mood smallint,
  notes text,
  duration_min integer,
  symptom_tags text[],
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists hc_logs_user_date on hc_logs (user_id, date desc);

create table if not exists hc_body (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  client_id text not null,
  date date not null,
  weight numeric,
  waist numeric,
  notes text,
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists hc_body_user_date on hc_body (user_id, date desc);

create table if not exists hc_user_state (
  user_id text primary key,
  profile_json jsonb,
  protocol_checks_json jsonb,
  updated_at timestamptz not null default now()
);

-- Solo el backend (service role) toca estas tablas; no uses la anon key en el cliente para escribir aquí.
