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
      const r = e.reason as
        | { name?: string; message?: string; stack?: string; type?: string; target?: unknown }
        | undefined
        | null;
      const ctor =
        r && typeof r === 'object' ? r.constructor?.name : typeof r;
      const target = (r as { target?: { src?: string; currentSrc?: string; tagName?: string } })?.target;
      console.error(
        '[unhandledRejection détaillé]',
        '\n  ctor   :', ctor,
        '\n  name   :', r?.name,
        '\n  message:', r?.message,
        '\n  type   :', r?.type,
        '\n  target :', target?.tagName, target?.currentSrc ?? target?.src,
        '\n  keys   :', r && typeof r === 'object' ? Object.keys(r) : '(n/a)',
        '\n  string :', String(r),
        '\n  stack  :', r?.stack,
      );
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
