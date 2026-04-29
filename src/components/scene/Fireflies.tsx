'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const VERT = /* glsl */ `
  attribute float aPhase;
  attribute float aDrift;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;

  void main() {
    // Lazy firefly drift — large amplitude, slow frequency, decoupled axes
    vec3 drift = vec3(
      sin(uTime * 0.05 + aPhase) * (0.4 + aDrift * 0.5),
      cos(uTime * 0.04 + aPhase * 1.3) * (0.32 + aDrift * 0.4),
      sin(uTime * 0.03 + aPhase * 0.7) * (0.28 + aDrift * 0.35)
    );
    vec3 pos = position + drift;

    // Slow blinking — non-linear curve so most fireflies hover near 0.6
    // and the brightest moments are punchier
    float pulse = sin(uTime * 0.65 + aPhase) * 0.5 + 0.5;
    vAlpha = mix(0.15, 1.0, pow(pulse, 1.6));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * (1.0 / max(-mv.z, 0.5));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    // Soft glow — bright core, smooth fade
    float core = 1.0 - smoothstep(0.0, 0.18, d);
    float halo = 1.0 - smoothstep(0.18, 0.5, d);
    float falloff = core * 0.9 + halo * 0.45;
    gl_FragColor = vec4(uColor, vAlpha * falloff);
  }
`;

export default function Fireflies({
  count = 28,
  color = '#F4D8E2',
  range = [12, 8, 6] as [number, number, number],
  centerZ = -1,
  size = 90,
}: {
  count?: number;
  color?: string;
  range?: [number, number, number];
  centerZ?: number;
  size?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, phases, drifts } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const drifts = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * range[0];
      positions[i * 3 + 1] = (Math.random() - 0.5) * range[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * range[2] + centerZ;
      phases[i] = Math.random() * Math.PI * 2;
      drifts[i] = Math.random();
    }
    return { positions, phases, drifts };
  }, [count, range, centerZ]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
    }),
    [color, size],
  );

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
          array={positions}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
          count={count}
          itemSize={1}
          array={phases}
        />
        <bufferAttribute
          attach="attributes-aDrift"
          args={[drifts, 1]}
          count={count}
          itemSize={1}
          array={drifts}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
