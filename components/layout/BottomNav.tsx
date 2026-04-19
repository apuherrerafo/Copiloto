'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const tabs = [
  {
    href: '/',
    label: 'Hoy',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}>
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
  },
  {
    href: '/copiloto',
    label: 'Copiloto',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeLinecap="round"/>
        <path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    href: '/registrar',
    label: 'Registrar',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}>
        <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/cuerpo',
    label: 'Cuerpo',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}>
        <circle cx="12" cy="5" r="2"/><path d="M12 7v5l-3 5M12 12l3 5M9 10h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/yo',
    label: 'Yo',
    icon: (a: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8}>
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-hairline safe-bottom z-50 shadow-soft">
      <div className="flex items-center justify-around px-1 pt-2 pb-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <motion.div key={tab.href} whileTap={{ scale: 0.94 }} className="rounded-xl">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  active ? 'text-sage' : 'text-muted'
                }`}
              >
                <motion.span
                  animate={{ scale: active ? 1.06 : 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  className="flex items-center justify-center"
                >
                  {tab.icon(active)}
                </motion.span>
                <span className={`text-[10px] ${active ? 'font-semibold' : 'font-normal'}`}>
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
