import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/**
 * Informe JSON de logs + medidas corporales para la cuenta actual.
 * Útil como “memoria” en la nube y para compartir con tu médico (exportación manual).
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') ?? 'json';

  const [logsRes, bodyRes, stateRes] = await Promise.all([
    supabase.from('hc_logs').select('*').eq('user_id', userId).order('timestamp_ms', { ascending: false }),
    supabase.from('hc_body').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('hc_user_state').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  if (logsRes.error || bodyRes.error || stateRes.error) {
    return NextResponse.json(
      { error: logsRes.error?.message ?? bodyRes.error?.message ?? stateRes.error?.message },
      { status: 500 },
    );
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    user: {
      id: userId,
      email: session.user.email,
      name: session.user.name,
    },
    profile: stateRes.data?.profile_json ?? null,
    logs: logsRes.data ?? [],
    body: bodyRes.data ?? [],
  };

  if (format === 'json') {
    return NextResponse.json(payload, {
      headers: {
        'Content-Disposition': `attachment; filename="hypocopilot-report-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  return NextResponse.json(payload);
}
