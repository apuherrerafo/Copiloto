'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const tabs = [
  {
    href: '/',
    label: 'Hoy',
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/copiloto',
    label: 'Chat',
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path
          d="M12 22a10 10 0 100-20 10 10 0 000 20z"
          strokeLinecap="round"
        />
        <path d="M8 13h.01M12 13h.01M16 13h.01" strokeLinecap="round" strokeWidth="2.25" />
      </svg>
    ),
  },
  {
    href: '/registrar',
    label: 'Registrar',
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/cuerpo',
    label: 'Cuerpo',
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v5l-3 5M12 12l3 5M9 10h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/yo',
    label: 'Yo',
    icon: (active: boolean) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <circle cx="12" cy="9" r="4" />
        <path d="M4 21c0-4.5 3.8-8 8-8s8 3.5 8 8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline/40 bg-background/80 backdrop-blur-md safe-bottom"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between px-3 pt-2 pb-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <motion.div key={tab.href} whileTap={{ scale: 0.92 }} className="flex-1">
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-0.5 pb-1"
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-[box-shadow,background-color] duration-200 ${
                    active
                      ? 'bg-[rgba(255,236,179,0.95)] text-ink shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_8px_24px_-8px_rgba(251,191,36,0.35)]'
                      : 'text-ink/55'
                  }`}
                >
                  {tab.icon(active)}
                </span>
                <span
                  className={`text-[10px] leading-none ${active ? 'font-semibold text-ink' : 'font-normal text-muted'}`}
                >
                  {tab.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
