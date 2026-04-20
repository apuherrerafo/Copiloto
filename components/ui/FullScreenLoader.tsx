'use client';

/**
 * Full-screen loading state (sign-in, saves, session bootstrap).
 * English copy; warm gradient inspired by reference mocks.
 */
export type FullScreenLoaderProps = {
  title?: string;
  subtitle?: string;
};

export default function FullScreenLoader({
  title = 'Hang tight…',
  subtitle = 'This may take a moment.',
}: FullScreenLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex min-h-[100dvh] flex-col items-center justify-center px-8"
      style={{
        background:
          'linear-gradient(168deg, #F5D58A 0%, #E8926A 38%, #D4746A 62%, #9B8AB8 100%)',
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-10 flex h-24 w-24 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-20 w-20" aria-hidden>
          <defs>
            <linearGradient id="loaderRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          <ellipse
            cx="52"
            cy="48"
            rx="28"
            ry="38"
            fill="none"
            stroke="url(#loaderRingGrad)"
            strokeWidth="10"
            transform="rotate(18 52 48)"
          />
          <ellipse
            cx="48"
            cy="52"
            rx="38"
            ry="28"
            fill="none"
            stroke="url(#loaderRingGrad)"
            strokeWidth="10"
            transform="rotate(-12 48 52)"
          />
        </svg>
      </div>

      <p className="max-w-[18rem] text-center text-[17px] font-semibold leading-snug text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.12)]">
        {title}
      </p>
      <p className="mt-3 max-w-[17rem] text-center text-[13px] leading-relaxed text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.1)]">
        {subtitle}
      </p>

      <span className="mt-10 h-9 w-9 animate-spin rounded-full border-2 border-white/35 border-t-white/95" />
    </div>
  );
}
