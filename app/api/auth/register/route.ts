import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const MIN_PASSWORD = 8;
const USERNAME_RE = /^[a-z0-9_]{1,10}$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const b = body as {
    email?: unknown;
    password?: unknown;
    username?: unknown;
    profile?: unknown;
  };

  const email = typeof b.email === 'string' ? normalizeEmail(b.email) : '';
  const password = typeof b.password === 'string' ? b.password : '';
  const username = typeof b.username === 'string' ? normalizeUsername(b.username) : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Correo no válido' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres` },
      { status: 400 },
    );
  }
  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: 'El usuario debe tener máx. 10 caracteres (letras, números o _)' },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Servidor sin Supabase configurado' }, { status: 503 });
  }

  const { data: existingEmail } = await admin
    .from('hc_credential_users')
    .select('user_id')
    .eq('email', email)
    .maybeSingle();
  if (existingEmail) {
    return NextResponse.json({ error: 'Ese correo ya está registrado' }, { status: 409 });
  }

  const { data: existingUser } = await admin
    .from('hc_credential_users')
    .select('user_id')
    .eq('username', username)
    .maybeSingle();
  if (existingUser) {
    return NextResponse.json({ error: 'Ese nombre de usuario ya existe. Elige otro.' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user_id = randomUUID();

  const { error: insertError } = await admin.from('hc_credential_users').insert({
    user_id,
    email,
    password_hash,
    username,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Guardar perfil inicial en hc_user_state si vienen datos
  if (b.profile && typeof b.profile === 'object') {
    const profileJson = {
      name: username,
      username,
      ...(b.profile as Record<string, unknown>),
    };
    await admin.from('hc_user_state').upsert(
      { user_id, profile_json: profileJson, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  }

  return NextResponse.json({ ok: true });
}
