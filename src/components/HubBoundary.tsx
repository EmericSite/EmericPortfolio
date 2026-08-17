// Emericfolio — created by Tomi-Tom, 2026
// Safety net around the 3D hub: a broken asset costs the hub, never the site
'use client';

import { Component, type ReactNode } from 'react';

/**
 * Anything loaded inside the Canvas throws through Suspense when it fails: a
 * missing poster, a texture served 503, a driver that refuses a context. With
 * no boundary of its own that throw climbs to app/error.tsx, which replaces the
 * entire page, About and Contact included, with "Le hub n'a pas pu se charger".
 * The flat grid already covers machines without WebGL, so it covers this too.
 */
export default class HubBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[hub] 3D scene unavailable, switching to the flat grid:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
