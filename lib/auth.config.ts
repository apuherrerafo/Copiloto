import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

const credentials = CredentialsProvider({
  id: 'credentials',
  name: 'Correo y contraseña',
  credentials: {
    email: { label: 'Correo', type: 'email' },
    password: { label: 'Contraseña', type: 'password' },
  },
  async authorize(creds) {
    const email = typeof creds?.email === 'string' ? normalizeEmail(creds.email) : '';
    const password = typeof creds?.password === 'string' ? creds.password : '';
    if (!email || !password) return null;

    const admin = getSupabaseAdmin();
    if (!admin) return null;

    const { data, error } = await admin
      .from('hc_credential_users')
      .select('user_id, password_hash, username')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) return null;
    const ok = await bcrypt.compare(password, data.password_hash);
    if (!ok) return null;

    return {
      id: data.user_id,
      email,
      name: (data.username as string | null) ?? email,
      // pass username through; stored in JWT below
      username: (data.username as string | null) ?? '',
    };
  },
});

const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const google =
  googleId && googleSecret
    ? GoogleProvider({ clientId: googleId, clientSecret: googleSecret })
    : null;

export const authOptions: NextAuthOptions = {
  providers: [credentials, ...(google ? [google] : [])],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/entrar' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.username = (user as { username?: string }).username ?? '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.username = token.username ?? '';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        /* ignore */
      }
      return baseUrl;
    },
  },
};
