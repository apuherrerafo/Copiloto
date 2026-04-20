'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const tabs: Tab[] = [
  {
    href: '/',
    label: 'Hoy',
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/historial',
    label: 'Historia',
    icon: (active) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
      >
        <path d="M7 4h8l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinejoin="round" />
        <path d="M9 11h6M9 15h6M9 7h3" strokeLinecap="round" />
        <path d="M14 4v4h4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/cuerpo',
    label: 'Cuerpo',
    icon: (active) => (
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
    icon: (active) => (
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
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);
  const fabActive = pathname === '/registrar';

  return (
    <>
      <Link
        href="/registrar"
        aria-label="Registrar"
        className="fixed bottom-[max(1.35rem,calc(env(safe-area-inset-bottom,0px)+0.85rem))] left-1/2 z-[60] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-sage text-white shadow-lift ring-4 ring-background/95 transition-transform active:scale-95 hover:brightness-105"
      >
        <motion.span
          animate={{ rotate: fabActive ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="text-[28px] font-light leading-none"
        >
          +
        </motion.span>
      </Link>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline/40 bg-background/85 backdrop-blur-md safe-bottom"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-lg items-end justify-between pt-2 pb-1 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]">
          <div className="flex flex-1 justify-around">
            {left.map((tab) => (
              <NavLink key={tab.href} tab={tab} active={pathname === tab.href} />
            ))}
          </div>

          <div aria-hidden className="w-16 shrink-0" />

          <div className="flex flex-1 justify-around">
            {right.map((tab) => (
              <NavLink key={tab.href} tab={tab} active={pathname === tab.href} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

function NavLink({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <motion.div
      whileTap={{ scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      className="min-w-0"
    >
      <Link
        href={tab.href}
        className="group flex flex-col items-center gap-0.5 pb-1 outline-none"
        aria-current={active ? 'page' : undefined}
      >
        <span
          className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ease-out
            group-active:scale-90 group-active:bg-sage/20 group-active:text-sage
            ${
              active
                ? 'bg-sage text-white shadow-[0_6px_16px_-4px_rgba(91,122,101,0.5)] ring-2 ring-sage/30 ring-offset-2 ring-offset-background/0'
                : 'text-ink/55 group-hover:text-ink/80'
            }`}
        >
          {tab.icon(active)}
        </span>
        <span
          className={`text-[10px] leading-none transition-colors ${
            active ? 'font-semibold text-sage' : 'font-normal text-muted group-active:text-sage'
          }`}
        >
          {tab.label}
        </span>
      </Link>
    </motion.div>
  );
}
