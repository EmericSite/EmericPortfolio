// Emericfolio — created by Tomi-Tom, 2026
// Development helper that prints readable details for errors the browser swallows
'use client';

import { useEffect } from 'react';

/**
 * Dev only: unwraps the opaque `unhandledRejection`/`error` events that Next
 * logs as `[object Error]`, to get the real message and stack.
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
