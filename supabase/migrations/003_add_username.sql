-- Agrega username a hc_credential_users (máx 10 chars, único, solo letras/números/guión bajo)
-- Ejecutar en Supabase SQL Editor después de 002_hc_credential_users.sql

alter table hc_credential_users
  add column if not exists username text,
  add constraint hc_credential_users_username_unique unique (username),
  add constraint hc_credential_users_username_len check (char_length(username) <= 10),
  add constraint hc_credential_users_username_chars check (username ~ '^[a-z0-9_]+$');

create index if not exists hc_credential_users_username on hc_credential_users (username);
