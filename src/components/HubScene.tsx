'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Float,
  useTexture,
} from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Mesh, Group, MeshStandardMaterial } from 'three';
import CartoucheOrbit from './scene/CartoucheOrbit';
import CameraRig from './scene/CameraRig';
import DynamicPostFX from './scene/DynamicPostFX';
import { PLAY_TRIANGLE } from './scene/playTriangle';
import { useHubStore } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useViewportScale } from '@/lib/useViewportScale';

// === Armillary halo system ===

function HaloA() {
  // Front-facing main ring (largest, iridescent)
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <torusGeometry args={[2.8, 0.045, 16, 160]} />
      <meshPhysicalMaterial
        color="#E8E6EC"
        metalness={1}
        roughness={0.04}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={0.8}
        iridescenceIOR={1.85}
        iridescenceThicknessRange={[120, 720]}
        envMapIntensity={1.9}
      />
    </mesh>
  );
}

function MidRing() {
  // Concentric front-facing ring between outer halo and inner ring
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.09;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.32]}>
      <torusGeometry args={[2.1, 0.018, 10, 96]} />
      <meshPhysicalMaterial
        color="#F4D8E2"
        metalness={1}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.08}
        envMapIntensity={2}
      />
    </mesh>
  );
}

function InnerRing() {
  const ref = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }, dt) => {
    if (ref.current) ref.current.rotation.z -= dt * 0.16;
    if (matRef.current) {
      // Subtle breathing pulse — pearl emissive desynced from MidRing
      matRef.current.emissiveIntensity =
        0.08 + Math.sin(clock.elapsedTime * 0.55) * 0.06;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.18]}>
      <torusGeometry args={[1.84, 0.013, 8, 96]} />
      <meshStandardMaterial
        ref={matRef}
        color="#F4D8E2"
        emissive="#F4D8E2"
        emissiveIntensity={0.08}
        metalness={1}
        roughness={0.08}
        envMapIntensity={2.4}
      />
    </mesh>
  );
}

function LogoBackplate() {
  // Un seul pin propre : corps sombre légèrement bombé + un liseré chromé au
  // bord (plus de disques empilés ni d'anneaux gravés multiples).
  return (
    <group position={[0, 0, -0.05]}>
      {/* Corps du pin */}
      <mesh>
        <circleGeometry args={[1.72, 96]} />
        <meshPhysicalMaterial
          color="#13111A"
          metalness={0.92}
          roughness={0.33}
          clearcoat={0.85}
          clearcoatRoughness={0.22}
          envMapIntensity={1.05}
        />
      </mesh>
      {/* Liseré chromé unique (rim du pin) */}
      <mesh position={[0, 0, 0.012]}>
        <torusGeometry args={[1.68, 0.022, 16, 200]} />
        <meshStandardMaterial
          color="#E8E6EC"
          metalness={1}
          roughness={0.11}
          envMapIntensity={2}
        />
      </mesh>
    </group>
  );
}

function ShowreelPlayMesh() {
  // Bouton posé sur le disque du pin, en 3D : il suit son inclinaison et son
  // flottement, contrairement à un overlay 2D qui restait plaqué à l'écran.
  // Rendu en meshes plutôt qu'en <Html transform>, qui rasterisait le bouton
  // à travers une transform CSS et le rendait flou.
  const groupRef = useRef<Group>(null);
  const openShowreel = useHubStore((s) => s.openShowreel);
  const mode = useHubStore((s) => s.mode);
  const reducedMotion = usePrefersReducedMotion();
  const hovered = useRef(false);
  const visible = mode === 'hub' || mode === 'hover';

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const breathe = reducedMotion
      ? 1
      : 1 + Math.sin(clock.elapsedTime * 2.2) * 0.045;
    const target = (hovered.current ? 1.12 : 1) * breathe;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, target, 0.15),
    );
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0.02]}>
      {/* Disque de fond, capte aussi le clic */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          openShowreel();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          if (typeof document !== 'undefined') {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          hovered.current = false;
          if (typeof document !== 'undefined') {
            document.body.style.cursor = '';
          }
        }}
      >
        <circleGeometry args={[0.42, 64]} />
        <meshBasicMaterial
          color="#08070C"
          transparent
          opacity={0.28}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Contour */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[0.4, 0.425, 64]} />
        <meshBasicMaterial
          color="#F4D8E2"
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Triangle */}
      <mesh geometry={PLAY_TRIANGLE} position={[0, 0, 0.002]}>
        <meshBasicMaterial
          color="#F4D8E2"
          transparent
          opacity={0.95}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ShowreelDisk() {
  // Affiche du showreel posée sur le pin, à la place de l'ancien logo. Plus
  // de révélation au survol : le visuel est visible en permanence.
  const tex = useTexture('/showreel-poster.webp');

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    // Cadrage « cover » : la source est en 3:2 et le disque est carré en UV,
    // on rogne la largeur et on recentre pour ne pas écraser l'image.
    const img = tex.image as { width?: number; height?: number } | undefined;
    if (img?.width && img?.height) {
      const aspect = img.width / img.height;
      if (aspect > 1) {
        tex.repeat.set(1 / aspect, 1);
        tex.offset.set((1 - 1 / aspect) / 2, 0);
      } else {
        tex.repeat.set(1, aspect);
        tex.offset.set(0, (1 - aspect) / 2);
      }
      tex.needsUpdate = true;
    }
  }, [tex]);

  return (
    <mesh position={[0, 0, 0.005]}>
      <circleGeometry args={[1.6, 128]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent />
    </mesh>
  );
}

function Relic() {
  const groupRef = useRef<Group>(null);
  const mode = useHubStore((s) => s.mode);
  const { mouse } = useThree();
  const { hubScale, layout } = useViewportScale();
  const reducedMotion = usePrefersReducedMotion();

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.18,
        0.045,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.y * 0.12,
        0.045,
      );
    }

    const targetScale = mode === 'project' ? 0.55 : 1;
    const scaleLerp = reducedMotion ? 0.015 : 0.05;
    const s = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      scaleLerp,
    );
    groupRef.current.scale.setScalar(s);

    const targetOpacity = mode === 'project' ? 0.25 : 1;
    const opacityLerp = reducedMotion ? 0.015 : 0.05;
    groupRef.current.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as MeshStandardMaterial;
        if ('opacity' in mat) {
          const next = THREE.MathUtils.lerp(
            mat.opacity,
            targetOpacity,
            opacityLerp,
          );
          if (Math.abs(mat.opacity - next) > 0.001) {
            if (!mat.transparent) mat.transparent = true;
            mat.opacity = next;
          }
        }
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -1.2]}>
      <group scale={hubScale}>
        <Float
          speed={reducedMotion ? 0 : 0.85}
          rotationIntensity={0.15}
          floatIntensity={0.55}
        >
          {/* Le pin porte l'affiche du showreel à la place du logo. Le bouton
              de lecture n'est posé dessus qu'en disposition orbite : en pile,
              le pin est réduit et masqué par les cartouches, c'est une
              cartouche showreel dédiée qui prend le relais. */}
          <HaloA />
          <MidRing />
          <InnerRing />
          <LogoBackplate />
          <ShowreelDisk />
          {layout === 'orbit' && <ShowreelPlayMesh />}
        </Float>
      </group>
    </group>
  );
}

export default function HubScene({
  showCartouches = true,
}: {
  showCartouches?: boolean;
}) {
  const tier = usePerformanceTier();
  const budget = tierBudget[tier];
  const { cameraZ, orbitRadius, cartoucheScale, layout } = useViewportScale();

  return (
    <Canvas
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      dpr={budget.dpr as [number, number]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
        stencil: false,
        depth: true,
      }}
      performance={{ min: 0.5 }}
      onPointerMissed={() => {
        const { activeId, setMode } = useHubStore.getState();
        if (activeId) setMode('hub');
      }}
    >
      <fog attach="fog" args={['#08070C', 3.6, 11]} />

      <ambientLight intensity={0.45} color="#F4D8E2" />
      <pointLight position={[5, 4, 5]} intensity={1.6} color="#FF2D9C" />
      <pointLight position={[-5, -2, 3]} intensity={0.5} color="#00F0FF" />
      <pointLight position={[0, 6, -4]} intensity={1.2} color="#F4D8E2" />
      <pointLight position={[0, -3, 4]} intensity={0.45} color="#E8E6EC" />
      <pointLight position={[2.5, 0, 3]} intensity={0.6} color="#FFB6CB" />

      <Suspense fallback={null}>
        <Relic />
        {showCartouches && (
          <CartoucheOrbit
            orbitRadius={orbitRadius}
            cartoucheScale={cartoucheScale}
            layout={layout}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>

      <CameraRig />
      <DynamicPostFX />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
