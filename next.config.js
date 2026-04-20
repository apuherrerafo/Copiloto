/** @type {import('next').NextConfig} */
const defaultRuntimeCache = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // NextAuth: never cache (avoids stuck "Loading…" session)
    {
      urlPattern: ({ url }) =>
        typeof self !== 'undefined' &&
        self.origin === url.origin &&
        url.pathname.startsWith('/api/auth/'),
      handler: 'NetworkOnly',
      options: { cacheName: 'next-auth-network-only' },
    },
    // Chat + sync: always network — never serve stale AI/data responses
    {
      urlPattern: ({ url }) =>
        typeof self !== 'undefined' &&
        self.origin === url.origin &&
        (url.pathname.startsWith('/api/chat') || url.pathname.startsWith('/api/sync') || url.pathname.startsWith('/api/report')),
      handler: 'NetworkOnly',
      options: { cacheName: 'api-realtime-network-only' },
    },
    // News feed: stale-while-revalidate, 1 h max-age, 24 h stale
    {
      urlPattern: ({ url }) =>
        typeof self !== 'undefined' &&
        self.origin === url.origin &&
        url.pathname.startsWith('/api/news'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-news-cache',
        expiration: { maxEntries: 1, maxAgeSeconds: 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    ...defaultRuntimeCache,
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
