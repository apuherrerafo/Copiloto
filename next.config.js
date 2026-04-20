/** @type {import('next').NextConfig} */
const defaultRuntimeCache = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // NextAuth: nunca cachear /api/auth/* en el SW (evita sesión colgada en "Cargando…").
  runtimeCaching: [
    {
      urlPattern: ({ url }) =>
        typeof self !== 'undefined' &&
        self.origin === url.origin &&
        url.pathname.startsWith('/api/auth/'),
      handler: 'NetworkOnly',
      options: { cacheName: 'next-auth-network-only' },
    },
    ...defaultRuntimeCache,
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
