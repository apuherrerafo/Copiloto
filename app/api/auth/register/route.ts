import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const MIN_PASSWORD = 8;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown }).email === 'string'
    ? normalizeEmail((body as { email: string }).email)
    : '';
  const password = typeof (body as { password?: unknown }).password === 'string'
    ? (body as { password: string }).password
    : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Correo no válido' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres` },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Servidor sin Supabase configurado' }, { status: 503 });
  }

  const { data: existing } = await admin.from('hc_credential_users').select('user_id').eq('email', email).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'Ese correo ya está registrado' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user_id = randomUUID();

  const { error } = await admin.from('hc_credential_users').insert({
    user_id,
    email,
    password_hash,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
