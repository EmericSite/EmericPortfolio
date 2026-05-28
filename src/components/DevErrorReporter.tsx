'use client';

import { useEffect } from 'react';

/**
 * Dev uniquement : déballe les `unhandledRejection`/`error` opaques (que Next
 * affiche en `[object Error]`) pour exposer le message + la stack réels, afin
 * de pouvoir identifier puis corriger la source. Aucun effet en production.
 */
export default function DevErrorReporter() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as unknown;
      const detail =
        r instanceof Error
          ? `${r.name}: ${r.message}\n${r.stack ?? ''}`
          : (() => {
              try {
                return JSON.stringify(r);
              } catch {
                return String(r);
              }
            })();
      console.error('[unhandledRejection détaillé]\n', detail, '\nraw:', r);
    };

    const onError = (e: ErrorEvent) => {
      console.error(
        '[error détaillé]\n',
        e.message,
        e.filename,
        `${e.lineno}:${e.colno}`,
        e.error,
      );
    };

    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onError);
    return () => {
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  return null;
}
