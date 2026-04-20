import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type LogPayload = {
  clientId: string;
  date: string;
  timestamp: number;
  type: string;
  label: string;
  value?: string | number | Record<string, unknown>;
  mood?: number;
  notes?: string;
  durationMin?: number;
  symptomTags?: string[];
};

type BodyPayload = {
  clientId: string;
  date: string;
  weight?: number;
  waist?: number;
  notes?: string;
};

/** GET: descarga todo el estado del usuario (misma cuenta en otro dispositivo). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ configured: false, logs: [], body: [], profile: null, protocolChecks: null });
  }

  const userId = session.user.id;

  const [logsRes, bodyRes, stateRes] = await Promise.all([
    supabase.from('hc_logs').select('*').eq('user_id', userId).order('timestamp_ms', { ascending: false }),
    supabase.from('hc_body').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('hc_user_state').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  if (logsRes.error) {
    return NextResponse.json({ error: logsRes.error.message }, { status: 500 });
  }
  if (bodyRes.error) {
    return NextResponse.json({ error: bodyRes.error.message }, { status: 500 });
  }
  if (stateRes.error) {
    return NextResponse.json({ error: stateRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    logs: logsRes.data ?? [],
    body: bodyRes.data ?? [],
    profile: stateRes.data?.profile_json ?? null,
    protocolChecks: stateRes.data?.protocol_checks_json ?? null,
  });
}

/** POST: sube registros / perfil / protocolo (idempotente por client_id). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
  }

  const userId = session.user.id;
  let body: {
    logs?: LogPayload[];
    body?: BodyPayload[];
    profile?: unknown;
    protocolChecks?: Record<string, Record<string, boolean>>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.logs?.length) {
    const rows = body.logs.map((l) => ({
      user_id: userId,
      client_id: l.clientId,
      date: l.date,
      timestamp_ms: l.timestamp,
      type: l.type,
      label: l.label,
      value_json: l.value === undefined ? null : l.value,
      mood: l.mood ?? null,
      notes: l.notes ?? null,
      duration_min: l.durationMin ?? null,
      symptom_tags: l.symptomTags ?? null,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('hc_logs').upsert(rows, { onConflict: 'user_id,client_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.body?.length) {
    const rows = body.body.map((b) => ({
      user_id: userId,
      client_id: b.clientId,
      date: b.date,
      weight: b.weight ?? null,
      waist: b.waist ?? null,
      notes: b.notes ?? null,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('hc_body').upsert(rows, { onConflict: 'user_id,client_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.profile !== undefined || body.protocolChecks !== undefined) {
    const { data: existing } = await supabase.from('hc_user_state').select('*').eq('user_id', userId).maybeSingle();

    const nextProfile = body.profile !== undefined ? body.profile : existing?.profile_json;
    const nextProto = body.protocolChecks !== undefined ? body.protocolChecks : existing?.protocol_checks_json;

    const { error } = await supabase.from('hc_user_state').upsert(
      {
        user_id: userId,
        profile_json: nextProfile ?? null,
        protocol_checks_json: nextProto ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
