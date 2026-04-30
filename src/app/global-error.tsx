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
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: '100vh',
          background: '#08070C',
          color: '#E8E6EC',
          fontFamily: 'monospace',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#FF2D9C',
              marginBottom: '1.5rem',
            }}
          >
            critical · scene crash
          </p>
          <h1
            style={{
              fontFamily: 'serif',
              fontSize: '2rem',
              color: '#F4D8E2',
              marginBottom: '1.5rem',
            }}
          >
            Le portfolio n&rsquo;a pas pu démarrer.
          </h1>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: '1px solid #2a2730',
              borderRadius: '999px',
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#E8E6EC',
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
