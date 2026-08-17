// Emericfolio — created by Tomi-Tom, 2026
// Environment map of the hub, served from public/ and unable to take the scene down
'use client';

import { Component, Suspense, type ReactNode } from 'react';
import { Environment } from '@react-three/drei';

// drei's presets are not bundled: preset="warehouse" downloads the HDRI from a
// GitHub-backed CDN on every visit. GitHub started answering 429 there, which
// threw inside the Suspense and sent every visitor to the error page. Same file
// (Poly Haven, CC0), served by our own domain.
const HDRI_URL = '/hdri/empty_warehouse_01_1k.hdr';

class EnvironmentBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[hub] environment map unavailable, lights only:', error);
  }

  render() {
    // Chrome loses its reflections without an env map, but the hub still runs:
    // a missing lighting texture must never cost the visitor the whole scene.
    return this.state.failed ? null : this.props.children;
  }
}

export default function SceneEnvironment() {
  return (
    <EnvironmentBoundary>
      <Suspense fallback={null}>
        <Environment files={HDRI_URL} />
      </Suspense>
    </EnvironmentBoundary>
  );
}
