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
    <html lang="es">
      <body style={{ margin: 0, background: '#fafaf8', fontFamily: 'sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '1.25rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            Algo salió mal
          </p>
          <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1.5rem' }}>
            {error.message ?? 'Error inesperado. Intenta recargar.'}
          </p>
          <button
            onClick={reset}
            style={{
              background: '#7ba07b',
              color: '#fff',
              border: 'none',
              borderRadius: '1rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
