/** Inline icon (replaces decorative emoji) for copilot / home links. */
export default function GeneIcon({ className = 'w-5 h-5 text-sage' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        d="M7 4c2 2 2 4 2 8s0 6-2 8M17 4c-2 2-2 4-2 8s0 6 2 8"
      />
      <path strokeLinecap="round" d="M9 7h4M11 9h4M9 12h6M11 15h4M9 17h4" opacity={0.85} />
    </svg>
  );
}
