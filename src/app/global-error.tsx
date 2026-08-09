// Emericfolio — created by Tomi-Tom, 2026
// Last-resort error page, used when the root layout itself fails to render
'use client';

import { useEffect } from 'react';
import { erreur } from '@/content/site';
import { palette } from '@/lib/palette';

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
          background: palette.ink,
          color: palette.chrome,
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
              color: palette.magenta,
              marginBottom: '1.5rem',
            }}
          >
            {erreur.criseSurtitre}
          </p>
          <h1
            style={{
              fontFamily: 'serif',
              fontSize: '2rem',
              color: palette.pearl,
              marginBottom: '1.5rem',
            }}
          >
            {erreur.criseTitre}
          </h1>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: `1px solid ${palette.fog}`,
              borderRadius: '999px',
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: palette.chrome,
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {erreur.bouton}
          </button>
        </div>
      </body>
    </html>
  );
}
