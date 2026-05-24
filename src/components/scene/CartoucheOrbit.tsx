'use client';

import { useFrame } from '@react-three/fiber';
import { Float, Html, RoundedBox, Text, useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from 'three';
import { projects, type Project } from '@/data/projects';
import { useHubStore } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { CartoucheLayout } from '@/lib/useViewportScale';

const PROJECT_BY_ID = new Map<string, Project>(projects.map((p) => [p.id, p]));

// Flat rounded-rect geometry for the poster face. Built as a 2D shape so the
// image texture isn't wrapped over any depth, and UVs are remapped to 0-1
// over the bounding box so cover-fit (texture.repeat/offset) works as expected.
const POSTER_W = 0.84;
const POSTER_H = 1.22;
const POSTER_R = 0.05;
const POSTER_GEOMETRY = (() => {
  const w = POSTER_W;
  const h = POSTER_H;
  const r = POSTER_R;
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const geo = new THREE.ShapeGeometry(s, 8);
  geo.computeBoundingBox();
  const bbox = geo.boundingBox;
  if (bbox) {
    const bw = bbox.max.x - bbox.min.x;
    const bh = bbox.max.y - bbox.min.y;
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(
        i,
        (pos.getX(i) - bbox.min.x) / bw,
        (pos.getY(i) - bbox.min.y) / bh,
      );
    }
    uv.needsUpdate = true;
  }
  return geo;
})();

const ORBIT_TILT = 0.42;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Z = 0.8;
// Profondeur couplée à la position horizontale via -cos(angle) : parallaxe
// symétrique gauche/droite, périodique. Ratio constant du rayon → cohérent à
// tous les breakpoints. Remplace l'ancien sin(angle*1.4)*0.45 (fréquence non
// entière, ni périodique ni symétrique → perçu comme aléatoire).
const ORBIT_DEPTH_RATIO = 0.15;
// Angle d'or : désynchronise la respiration de chaque carte de façon organique
// (la répartition angulaire reste équiangulaire — la plus lisible pour un anneau).
const GOLDEN_ANGLE = 2.399963229728653; // 137.5078° en radians
// Stack (mobile) : espacement régulier + échelle géométrique (quarte ≈ 1.333).
const STACK_GAP_X = 0.42;
const STACK_SCALE_RATIO = 1.333;
const ACTIVE_TARGET = new THREE.Vector3(-0.7, 0, 1.6);
const ACTIVE_LOOK = new THREE.Vector3(0, 0, 4.6);
const LOOK_AT = new THREE.Vector3(0, 0, 1.2);

function LensFlare({ accent }: { accent: string }) {
  // Stacked scanlines that sweep the card vertically + glitchy effects.
  // No halo, no middle streak; chrome contour glow handled in parent.
  const scanARef = useRef<Mesh>(null);
  const scanAMatRef = useRef<MeshBasicMaterial>(null);
  const scanBRef = useRef<Mesh>(null);
  const scanBMatRef = useRef<MeshBasicMaterial>(null);
  const scanCRef = useRef<Mesh>(null);
  const scanCMatRef = useRef<MeshBasicMaterial>(null);

  return (
    <group position={[0, 0, 0.045]}>
      {/* Primary thick scanline — fast sweep */}
      <mesh ref={scanARef}>
        <planeGeometry args={[0.82, 0.012]} />
        <meshBasicMaterial
          ref={scanAMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Secondary thinner scanline — slower, phase-offset */}
      <mesh ref={scanBRef} position={[0, 0, 0.001]}>
        <planeGeometry args={[0.82, 0.005]} />
        <meshBasicMaterial
          ref={scanBMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Tertiary very-thin glitch line — fast erratic */}
      <mesh ref={scanCRef} position={[0, 0, 0.002]}>
        <planeGeometry args={[0.82, 0.003]} />
        <meshBasicMaterial
          ref={scanCMatRef}
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <FlareDriver
        scanARef={scanARef}
        scanAMatRef={scanAMatRef}
        scanBRef={scanBRef}
        scanBMatRef={scanBMatRef}
        scanCRef={scanCRef}
        scanCMatRef={scanCMatRef}
        accent={accent}
      />
    </group>
  );
}

function FlareDriver({
  scanARef,
  scanAMatRef,
  scanBRef,
  scanBMatRef,
  scanCRef,
  scanCMatRef,
  accent,
}: {
  scanARef: React.RefObject<Mesh | null>;
  scanAMatRef: React.RefObject<MeshBasicMaterial | null>;
  scanBRef: React.RefObject<Mesh | null>;
  scanBMatRef: React.RefObject<MeshBasicMaterial | null>;
  scanCRef: React.RefObject<Mesh | null>;
  scanCMatRef: React.RefObject<MeshBasicMaterial | null>;
  accent: string;
}) {
  useFrame(({ clock }) => {
    const { hoveredId, activeId } = useHubStore.getState();
    const hovered = hoveredId ? PROJECT_BY_ID.get(hoveredId) : null;
    const isLit = !activeId && hovered?.accent === accent;
    const t = clock.elapsedTime;

    // Primary scanline — bottom→top sweep every ~1.4s when lit
    if (scanAMatRef.current && scanARef.current) {
      const cycle = ((t * 0.7) % 1) * 1.22 - 0.61;
      scanARef.current.position.y = isLit ? cycle : -2;
      scanAMatRef.current.opacity = THREE.MathUtils.lerp(
        scanAMatRef.current.opacity,
        isLit ? 0.85 : 0,
        0.25,
      );
    }

    // Secondary scanline — slower (~3.5s), phase-offset by 0.5
    if (scanBMatRef.current && scanBRef.current) {
      const cycle = ((t * 0.28 + 0.5) % 1) * 1.22 - 0.61;
      scanBRef.current.position.y = isLit ? cycle : -2;
      scanBMatRef.current.opacity = THREE.MathUtils.lerp(
        scanBMatRef.current.opacity,
        isLit ? 0.5 : 0,
        0.25,
      );
    }

    // Tertiary glitch line — erratic jumps, white core, occasional brief flash
    if (scanCMatRef.current && scanCRef.current) {
      // Random-ish vertical position via two desynced sins
      const jumpY = Math.sin(t * 1.7 + Math.sin(t * 0.4) * 5) * 0.55;
      // Visibility flickers — only flashes briefly, then hides
      const flashWindow = Math.sin(t * 5.3) > 0.7 ? 1 : 0;
      scanCRef.current.position.y = isLit ? jumpY : -2;
      scanCMatRef.current.opacity = THREE.MathUtils.lerp(
        scanCMatRef.current.opacity,
        isLit ? 0.95 * flashWindow : 0,
        0.55,
      );
    }
  });

  return null;
}

function Cartouche({
  project,
  index,
  total,
  hoverFXEnabled,
  orbitRadius,
  cartoucheScale,
  layout,
}: {
  project: Project;
  index: number;
  total: number;
  hoverFXEnabled: boolean;
  orbitRadius: number;
  cartoucheScale: number;
  layout: CartoucheLayout;
}) {
  const groupRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);
  const accentMatRef = useRef<MeshStandardMaterial>(null);
  const chromeMatRef = useRef<MeshPhysicalMaterial>(null);
  const gemMatRef = useRef<MeshStandardMaterial>(null);
  const cachedMats = useRef<THREE.Material[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  // Fly-in: cartouches start far behind the camera (Z negative) and lerp to
  // their orbital position. Each one starts a bit further back than the next
  // so they arrive staggered.
  const FLY_IN_OFFSET_Z = -8 - index * 4;
  const breathPhase = index * GOLDEN_ANGLE;

  const setHovered = useHubStore((s) => s.setHovered);
  const setActive = useHubStore((s) => s.setActive);
  const startVideo = useHubStore((s) => s.startVideo);
  const isActive = useHubStore((s) => s.activeId === project.id);
  const videoStarted = useHubStore((s) => s.videoStarted);

  const angleOffset = (index / total) * Math.PI * 2;
  const orbitTarget = useRef(new THREE.Vector3());

  // Load poster texture. La configuration se fait dans le callback onLoad du
  // loader (là où la texture est construite) plutôt qu'en mutant la valeur
  // renvoyée par le hook — ce que la règle react-hooks/immutability interdit.
  const tex = useTexture(project.posterUrl, (loaded) => {
    const t = (Array.isArray(loaded) ? loaded[0] : loaded) as THREE.Texture;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;

    // Cover-fit: preserve image aspect ratio, crop center to fill the panel.
    // Panel face is 0.84 × 1.22 (portrait). Without this, posters with a
    // different aspect get stretched.
    const img = t.image as { width?: number; height?: number } | undefined;
    if (img?.width && img?.height) {
      const panelAspect = 0.84 / 1.22;
      const imgAspect = img.width / img.height;
      if (imgAspect > panelAspect) {
        const r = panelAspect / imgAspect;
        t.repeat.set(r, 1);
        t.offset.set((1 - r) / 2, 0);
      } else {
        const r = imgAspect / panelAspect;
        t.repeat.set(1, r);
        t.offset.set(0, (1 - r) / 2);
      }
    }
    t.needsUpdate = true;
  });

  // Affecter la map au matériau (mutation d'un ref three.js — autorisée).
  useEffect(() => {
    const mat = accentMatRef.current;
    if (mat) {
      mat.map = tex;
      mat.needsUpdate = true;
    }
  }, [tex]);

  // Cache materials once after mount so per-frame updates don't traverse the tree.
  useEffect(() => {
    const mats: THREE.Material[] = [];
    innerRef.current?.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) {
          for (const sub of mat) mats.push(sub);
        } else {
          mats.push(mat);
        }
      }
    });
    cachedMats.current = mats;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || !innerRef.current) return;

    const { mode, hoveredId, activeId, scrollIndex } = useHubStore.getState();
    const isActive = activeId === project.id;
    const isHovered = hoveredId === project.id;
    const isFocused =
      isHovered ||
      ((mode === 'hub' || mode === 'hover') && scrollIndex === index);
    const isDimmed = activeId !== null && !isActive;
    const isOffstage = mode === 'about' || mode === 'contact';

    const positionLerp = reducedMotion ? 0.015 : 0.08;
    const activeLerp = reducedMotion ? 0.015 : 0.06;

    // Compute wrapped stack offset (used both for positioning and scaling)
    let stackOffset = index - scrollIndex;
    if (stackOffset > total / 2) stackOffset -= total;
    if (stackOffset < -total / 2) stackOffset += total;
    const isStackFront = layout === 'stack' && stackOffset === 0;

    if (isActive) {
      groupRef.current.position.lerp(ACTIVE_TARGET, activeLerp);
      groupRef.current.lookAt(ACTIVE_LOOK);
    } else if (layout === 'stack') {
      const sign = stackOffset === 0 ? 0 : Math.sign(stackOffset);
      const abs = Math.abs(stackOffset);
      // Espacement régulier (GAP_X constant) au lieu de 0.5 + (abs-1)*0.18 qui
      // créait un premier décalage disproportionné.
      orbitTarget.current.set(
        sign * STACK_GAP_X * abs,
        -abs * 0.05,
        ORBIT_CENTER_Z + (isStackFront ? 0.4 : -0.28 * abs),
      );
      groupRef.current.position.lerp(orbitTarget.current, positionLerp);
      groupRef.current.lookAt(LOOK_AT);
    } else {
      const angle = angleOffset + clock.elapsedTime * ORBIT_SPEED;
      orbitTarget.current.set(
        Math.cos(angle) * orbitRadius,
        Math.sin(angle) * orbitRadius * ORBIT_TILT,
        ORBIT_CENTER_Z - Math.cos(angle) * orbitRadius * ORBIT_DEPTH_RATIO,
      );
      groupRef.current.position.lerp(orbitTarget.current, positionLerp);
      groupRef.current.lookAt(LOOK_AT);
    }

    // Échelle modulaire : ratio géométrique constant (quarte ≈ 1.333) au lieu
    // d'une décroissance linéaire — progression de tailles harmonieuse.
    const stackScale = isStackFront
      ? 1.4
      : Math.max(0.45, 1.4 / Math.pow(STACK_SCALE_RATIO, Math.abs(stackOffset)));
    const targetScale = isActive
      ? 1.5
      : layout === 'stack'
        ? stackScale
        : isFocused
          ? 1.18
          : 0.95;
    const scaleLerp = reducedMotion ? 0.015 : 0.08;
    const s = THREE.MathUtils.lerp(
      innerRef.current.scale.x,
      targetScale,
      scaleLerp,
    );
    innerRef.current.scale.setScalar(s);

    // Active = clean image (no emissive wash). Focused = subtle accent halo.
    const targetEmissive = isActive ? 0.0 : isFocused ? 0.22 : 0.0;
    if (accentMatRef.current) {
      accentMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        accentMatRef.current.emissiveIntensity,
        targetEmissive,
        0.1,
      );
    }

    // Chrome contour shine on hover — emissive accent boost gives the
    // border a glowing edge in the project's color
    if (chromeMatRef.current) {
      const targetChromeEmissive = isHovered ? 0.55 : 0.0;
      chromeMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        chromeMatRef.current.emissiveIntensity,
        targetChromeEmissive,
        0.12,
      );
    }

    // Breathing pulse on the gem (subtle, desynced per cartouche)
    if (gemMatRef.current && !reducedMotion) {
      const base = isFocused || isActive ? 1.9 : 1.4;
      gemMatRef.current.emissiveIntensity =
        base + Math.sin(clock.elapsedTime * 1.4 + breathPhase) * 0.35;
    }

    const stackFade =
      layout === 'stack' && !isStackFront
        ? Math.max(0.25, 1 - Math.abs(stackOffset) * 0.3)
        : 1;
    const targetOpacity = isDimmed
      ? 0.05
      : isOffstage
        ? 0.4
        : stackFade;
    const opacityLerp = reducedMotion ? 0.015 : 0.08;
    const mats = cachedMats.current;
    for (let i = 0; i < mats.length; i++) {
      const mat = mats[i] as MeshStandardMaterial;
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

  return (
    <group ref={groupRef} position={[0, 0, FLY_IN_OFFSET_Z]} scale={cartoucheScale}>
      <Float
        speed={reducedMotion ? 0 : 0.85}
        rotationIntensity={0.05}
        floatIntensity={0.2}
      >
        {hoverFXEnabled && <LensFlare accent={project.accent} />}
        <group
          ref={innerRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(project.id);
            if (typeof document !== 'undefined') {
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(null);
            if (typeof document !== 'undefined') {
              document.body.style.cursor = '';
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActive(project.id);
          }}
        >
          {/* Chrome backplate */}
          <RoundedBox
            args={[0.92, 1.3, 0.05]}
            radius={0.06}
            smoothness={5}
            position={[0, 0, -0.025]}
          >
            <meshPhysicalMaterial
              ref={chromeMatRef}
              color="#E8E6EC"
              emissive={project.accent}
              emissiveIntensity={0}
              metalness={1}
              roughness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.06}
              iridescence={0.25}
              iridescenceIOR={1.7}
              iridescenceThicknessRange={[100, 600]}
              envMapIntensity={1.8}
              transparent
              opacity={1}
            />
          </RoundedBox>

          {/* Corner rivets */}
          {(
            [
              [-0.4, 0.59],
              [0.4, 0.59],
              [-0.4, -0.59],
              [0.4, -0.59],
            ] as [number, number][]
          ).map(([rx, ry], i) => (
            <mesh key={`rivet-${i}`} position={[rx, ry, 0.005]}>
              <sphereGeometry args={[0.011, 14, 14]} />
              <meshStandardMaterial
                color="#E8E6EC"
                metalness={1}
                roughness={0.04}
                envMapIntensity={2.2}
                transparent
                opacity={1}
              />
            </mesh>
          ))}

          {/* Poster face — flat rounded shape, no side walls to stretch the
              texture across. Sits just in front of the chrome backplate. */}
          <mesh geometry={POSTER_GEOMETRY} position={[0, 0, 0.026]}>
            <meshStandardMaterial
              ref={accentMatRef}
              color="#ffffff"
              emissive={project.accent}
              emissiveIntensity={0}
              metalness={0.05}
              roughness={0.6}
              transparent
              opacity={1}
            />
          </mesh>

          {/* Top index chip */}
          <mesh position={[-0.3, 0.5, 0.038]}>
            <planeGeometry args={[0.14, 0.075]} />
            <meshBasicMaterial
              color="#08070C"
              transparent
              opacity={0.78}
              toneMapped={false}
            />
          </mesh>
          <Text
            position={[-0.3, 0.5, 0.04]}
            fontSize={0.06}
            color="#E8E6EC"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {`0${index + 1}`}
          </Text>

          {/* Top year chip */}
          <mesh position={[0.3, 0.5, 0.038]}>
            <planeGeometry args={[0.18, 0.075]} />
            <meshBasicMaterial
              color="#08070C"
              transparent
              opacity={0.78}
              toneMapped={false}
            />
          </mesh>
          <Text
            position={[0.3, 0.5, 0.04]}
            fontSize={0.05}
            color="#E8E6EC"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            {project.year}
          </Text>

          {/* Bottom info banner — dark band spanning the full front width */}
          <mesh position={[0, -0.36, 0.038]}>
            <planeGeometry args={[0.92, 0.5]} />
            <meshBasicMaterial
              color="#08070C"
              transparent
              opacity={0.82}
              toneMapped={false}
            />
          </mesh>

          {/* Title in banner */}
          <Text
            position={[0, -0.22, 0.04]}
            fontSize={0.105}
            color="#F4D8E2"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.74}
            textAlign="center"
            lineHeight={1.0}
            letterSpacing={-0.005}
          >
            {project.shortTitle}
          </Text>

          {/* Tag in banner */}
          <Text
            position={[0, -0.4, 0.04]}
            fontSize={0.038}
            color="#B8B0BE"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.18}
          >
            {project.tag.toUpperCase()}
          </Text>

          {/* Bottom emblem — chrome ring with emissive accent gem */}
          <mesh position={[0, -0.55, 0.05]}>
            <torusGeometry args={[0.022, 0.005, 10, 28]} />
            <meshStandardMaterial
              color="#E8E6EC"
              metalness={1}
              roughness={0.06}
              envMapIntensity={1.8}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, -0.55, 0.05]}>
            <circleGeometry args={[0.012, 32]} />
            <meshStandardMaterial
              ref={gemMatRef}
              color={project.accent}
              emissive={project.accent}
              emissiveIntensity={1.6}
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
        </group>
        {isActive && !videoStarted && (
          <Html
            position={[0, 0, 0.12]}
            center
            zIndexRange={[100, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="relative flex items-center justify-center">
              <span
                className="play-ring absolute inset-0 rounded-full border-2"
                style={{ borderColor: project.accent }}
                aria-hidden
              />
              <span
                className="play-ring absolute inset-0 rounded-full border-2"
                style={{ borderColor: project.accent, animationDelay: '0.8s' }}
                aria-hidden
              />
              <span
                className="play-ring absolute inset-0 rounded-full border-2"
                style={{ borderColor: project.accent, animationDelay: '1.6s' }}
                aria-hidden
              />
              <span
                className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 75%)',
                  transform: 'scale(1.35)',
                }}
                aria-hidden
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startVideo();
                }}
                aria-label={`Lire ${project.title}`}
                className="play-breathe relative flex h-28 w-28 items-center justify-center rounded-full border-2 bg-ink/75 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-ink/90"
                style={{
                  borderColor: project.accent,
                  boxShadow: `0 0 60px -2px rgba(255,255,255,0.35), 0 0 48px -4px ${project.accent}, inset 0 0 24px -12px ${project.accent}`,
                }}
              >
                <span
                  className="ml-1.5 text-4xl"
                  style={{
                    color: project.accent,
                    textShadow: `0 0 26px ${project.accent}, 0 0 12px ${project.accent}`,
                  }}
                >
                  ▶
                </span>
                <span
                  className="absolute -bottom-7 font-mono text-[9px] uppercase tracking-[0.3em] whitespace-nowrap"
                  style={{ color: project.accent, opacity: 0.85 }}
                >
                  play
                </span>
              </button>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}

export default function CartoucheOrbit({
  orbitRadius = 2.3,
  cartoucheScale = 1,
  layout = 'orbit',
}: {
  orbitRadius?: number;
  cartoucheScale?: number;
  layout?: CartoucheLayout;
} = {}) {
  const tier = usePerformanceTier();
  const hoverFXEnabled = tierBudget[tier].hoverFX;
  return (
    <group>
      {projects.map((p, i) => (
        <Cartouche
          key={p.id}
          project={p}
          index={i}
          total={projects.length}
          hoverFXEnabled={hoverFXEnabled}
          orbitRadius={orbitRadius}
          cartoucheScale={cartoucheScale}
          layout={layout}
        />
      ))}
    </group>
  );
}
