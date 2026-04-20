-- Usuarios email/contraseña (NextAuth Credentials). user_id = id estable para hc_* sync.
-- Ejecutar en Supabase SQL Editor si ya aplicaste 001_hypocopilot.sql

create table if not exists hc_credential_users (
  user_id text primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists hc_credential_users_email_lower on hc_credential_users (lower(email));
