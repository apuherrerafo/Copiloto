/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // No uses un patrón global tipo /^https?.*/: cachea incluso /_next/static y tras un nuevo
  // build los chunks cambian de hash → 404 y la app queda en blanco. Deja los defaults de next-pwa.
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
