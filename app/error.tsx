'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif italic text-2xl text-ink mb-2">Something went wrong</p>
      <p className="text-sm text-muted mb-6 max-w-xs">
        {error.message ?? 'Unexpected error. Please try reloading the page.'}
      </p>
      <button
        onClick={reset}
        className="rounded-2xl bg-sage text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
