// Emericfolio — created by Tomi-Tom, 2026
// The floating project cards of the hub: their look, their motion and their clicks

'use client';

import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Text, useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { Group, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { projects, type Project } from '@/data/projects';
import { showreelCard, showreelIndex } from '@/data/showreel';
import { palette } from '@/lib/palette';
import { useHubStore } from '@/store/hub';
import { pad2 } from '@/lib/format';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import type { CartoucheLayout } from '@/lib/useViewportScale';
import { wrappedRank } from '@/lib/wrappedRank';
import ScanLines from './cartouche/ScanLines';
import PlayOverlay from './cartouche/PlayOverlay';
import { easeEmissive, fadeOpacity, preparePosterTexture } from './materials';
import { useCachedMaterials } from './useCachedMaterials';
import {
  BANNER_GEOMETRY,
  BAND_CENTER_Y,
  CHIP_INDEX_GEOMETRY,
  CHIP_YEAR_GEOMETRY,
  POSTER_ASPECT,
  POSTER_GEOMETRY,
  Z_BANNER,
  Z_CHIP,
  Z_EMBLEM,
  Z_TEXT,
} from './cartouche/geometries';
import {
  GOLDEN_ANGLE,
  HOVER_FACE_AMOUNT,
  flyInZ,
  newQuatPair,
  orbitAngleOffset,
  placeActive,
  placeOnOrbit,
  placeStacked,
  slerpTowardCamera,
  targetCardOpacity,
  targetCardScale,
} from './cartouche/layout';

// Without this prop, troika resolves its default font through a hardcoded
// jsdelivr URL. A blocked CDN there leaves the promise pending forever, the
// whole hub stays suspended and empty, and nothing reports it. Same file as the
// one it used to fetch, so the lettering is unchanged.
const CARTOUCHE_FONT = '/fonts/sans-serif.normal.400.woff';

function Cartouche({
  project,
  index,
  total,
  hoverFXEnabled,
  orbitRadius,
  cartoucheScale,
  layout,
  showreel = false,
}: {
  project: Project;
  index: number;
  total: number;
  hoverFXEnabled: boolean;
  orbitRadius: number;
  cartoucheScale: number;
  layout: CartoucheLayout;
  /** Showreel card: poster face only, no index chip, title or tag. */
  showreel?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);
  const accentMatRef = useRef<MeshStandardMaterial>(null);
  const chromeMatRef = useRef<MeshPhysicalMaterial>(null);
  const gemMatRef = useRef<MeshStandardMaterial>(null);
  const cachedMats = useCachedMaterials(innerRef);
  const reducedMotion = usePrefersReducedMotion();

  const breathPhase = index * GOLDEN_ANGLE;

  const setHovered = useHubStore((s) => s.setHovered);
  const setActive = useHubStore((s) => s.setActive);
  const startProjectVideo = useHubStore((s) => s.startProjectVideo);
  const openShowreel = useHubStore((s) => s.openShowreel);
  const showPlayOverlay = useHubStore((s) => {
  if (showreel) return false;
  if (s.activeId === project.id) return true;
  return (
    layout === 'stack' &&
    (s.mode === 'hub' || s.mode === 'hover') &&
    s.scrollIndex === index &&
    s.activeId === null
  );
});
  const videoStarted = useHubStore((s) => s.videoStarted);

  const angleOffset = orbitAngleOffset(index, total);
  const orbitTarget = useRef(new THREE.Vector3());

  const hoverFace = useRef(0);
  const quats = useRef(newQuatPair());

  const tex = useTexture(project.posterUrl, (loaded) =>
    preparePosterTexture(loaded, POSTER_ASPECT),
  );

  useEffect(() => {
    const mat = accentMatRef.current;
    if (mat) {
      mat.map = tex;
      mat.needsUpdate = true;
    }
  }, [tex]);

  // A card can be unmounted while hovered (layout change), and onPointerOut
  // never fires then: the cursor would stay stuck on pointer.
  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  useFrame(({ clock, camera }) => {
    const group = groupRef.current;
    const inner = innerRef.current;
    if (!group || !inner) return;

    const { mode, hoveredId, activeId, scrollIndex, dragOffset } =
      useHubStore.getState();
    // The showreel card is never active: clicking it opens the player, not a panel.
    const isActiveCard = !showreel && activeId === project.id;
    const isHovered = hoveredId === project.id;
    const isFocused =
      isHovered ||
      ((mode === 'hub' || mode === 'hover') && scrollIndex === index);
    const isDimmed = activeId !== null && !isActiveCard;
    const isOffstage = mode === 'about' || mode === 'contact';

    const cam = camera.position;
    const target = orbitTarget.current;
    const elapsed = clock.elapsedTime;
    const baseLerp = reducedMotion ? 0.015 : 0.08;
    const stackOffset = wrappedRank(index, scrollIndex, total) - dragOffset;
    const stackAbs = Math.abs(stackOffset);

    if (isActiveCard) {
      placeActive(group, reducedMotion ? 0.015 : 0.06);
    } else if (layout === 'stack') {
      placeStacked(group, target, cam, stackOffset, dragOffset, baseLerp);
    } else {
      placeOnOrbit(group, target, angleOffset, elapsed, orbitRadius, baseLerp);
    }

    // On hover the card turns partway toward the viewer and eases back on exit.
    const targetFace = isHovered && !isActiveCard ? HOVER_FACE_AMOUNT : 0;
    const faceLerp = reducedMotion ? 0.02 : 0.09;
    hoverFace.current = THREE.MathUtils.lerp(
      hoverFace.current,
      targetFace,
      faceLerp,
    );
    if (!isActiveCard && hoverFace.current > 0.001) {
      slerpTowardCamera(group, quats.current, hoverFace.current, cam);
    }

    const scale = targetCardScale(isActiveCard, layout, stackAbs, isFocused);
    inner.scale.setScalar(THREE.MathUtils.lerp(inner.scale.x, scale, baseLerp));

    // Active = clean image, no emissive wash. Focused = subtle accent halo.
    const halo = isActiveCard ? 0 : isFocused ? 0.14 : 0;
    easeEmissive(accentMatRef.current, halo, 0.1);
    // Hover makes the chrome border glow in the project accent.
    easeEmissive(chromeMatRef.current, isHovered ? 0.55 : 0, 0.12);

    // Breathing pulse on the gem, desynced per cartouche.
    if (gemMatRef.current && !reducedMotion) {
      const base = isFocused || isActiveCard ? 1.9 : 1.4;
      gemMatRef.current.emissiveIntensity =
        base + Math.sin(elapsed * 1.4 + breathPhase) * 0.35;
    }

    const opacity = targetCardOpacity(isDimmed, isOffstage, layout, stackAbs);
    fadeOpacity(cachedMats.current, opacity, baseLerp);
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, flyInZ(index)]}
      scale={cartoucheScale}
    >
      <Float
        speed={reducedMotion ? 0 : 0.85}
        rotationIntensity={0.05}
        floatIntensity={0.2}
      >
        {hoverFXEnabled && (
          <ScanLines
            accent={project.accent}
            projectId={showreel ? null : project.id}
          />
        )}
        <group
          ref={innerRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            // The showreel card is not a project: flagging it as hovered would
            // corrupt the current index and the hover effects.
            if (!showreel) setHovered(project.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (!showreel) setHovered(null);
            document.body.style.cursor = '';
          }}
          onClick={(e) => {
            e.stopPropagation();
            // The showreel plays straight away, it opens no project panel.
            if (showreel) openShowreel();
            else {
              if (layout !== 'stack') {
                setActive(project.id);
                return;
              }

              const localPoint = e.point.clone();
              innerRef.current?.worldToLocal(localPoint);
              const isCenter =
                Math.abs(localPoint.x) < 0.25 && Math.abs(localPoint.y) < 0.36;
              if (isCenter) startProjectVideo(project.id);
              else setActive(project.id);
            }
          }}
        >
          <RoundedBox
            args={[0.92, 1.3, 0.05]}
            radius={0.06}
            smoothness={5}
            position={[0, 0, -0.025]}
          >
            <meshPhysicalMaterial
              ref={chromeMatRef}
              color={palette.chrome}
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
                color={palette.chrome}
                metalness={1}
                roughness={0.04}
                envMapIntensity={2.2}
                transparent
                opacity={1}
              />
            </mesh>
          ))}

          {/* Poster face: flat shape, no side walls to stretch the texture across. */}
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

          {!showreel && (
            <>
              <mesh
                geometry={CHIP_INDEX_GEOMETRY}
                position={[-0.3, 0.5, Z_CHIP]}
                renderOrder={4}
              >
                <meshBasicMaterial
                  color={palette.ink}
                  transparent
                  opacity={0.78}
                  toneMapped={false}
                  depthWrite={false}
                  polygonOffset
                  polygonOffsetFactor={-2}
                  polygonOffsetUnits={-2}
                />
              </mesh>
              <Text
                position={[-0.3, 0.5, Z_TEXT]}
                renderOrder={6}
                font={CARTOUCHE_FONT}
                fontSize={0.06}
                color={palette.chrome}
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.06}
              >
                {pad2(index + 1)}
              </Text>

              <mesh
                geometry={CHIP_YEAR_GEOMETRY}
                position={[0.3, 0.5, Z_CHIP]}
                renderOrder={4}
              >
                <meshBasicMaterial
                  color={palette.ink}
                  transparent
                  opacity={0.78}
                  toneMapped={false}
                  depthWrite={false}
                  polygonOffset
                  polygonOffsetFactor={-2}
                  polygonOffsetUnits={-2}
                />
              </mesh>
              <Text
                position={[0.3, 0.5, Z_TEXT]}
                renderOrder={6}
                font={CARTOUCHE_FONT}
                fontSize={0.05}
                color={palette.chrome}
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.08}
              >
                {project.year}
              </Text>

              {/* Band gradient comes from vertexColors; opacity is the global fade. */}
              <mesh
                geometry={BANNER_GEOMETRY}
                position={[0, BAND_CENTER_Y, Z_BANNER]}
                renderOrder={2}
              >
                <meshBasicMaterial
                  color={palette.ink}
                  vertexColors
                  transparent
                  opacity={1}
                  toneMapped={false}
                  depthWrite={false}
                  polygonOffset
                  polygonOffsetFactor={-1}
                  polygonOffsetUnits={-1}
                />
              </mesh>

              <Text
                position={[0, -0.22, Z_TEXT]}
                renderOrder={6}
font={typeof CARTOUCHE_FONT !== 'undefined' ? CARTOUCHE_FONT : "/fonts/Inter-Regular.ttf"}
                fontSize={0.105}
                color={palette.pearl}
                anchorX="center"
                anchorY="middle"
                maxWidth={0.74}
                textAlign="center"
                lineHeight={1.0}
                letterSpacing={-0.005}
                outlineWidth={0.004}
                outlineColor={palette.ink}
                outlineOpacity={0.65}
              >
                {project.shortTitle}
              </Text>

              <Text
                position={[0, -0.4, Z_TEXT]}
                renderOrder={6}
                font={CARTOUCHE_FONT}
                fontSize={0.038}
                color={palette.mist}
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.18}
                outlineWidth={0.002}
                outlineColor={palette.ink}
                outlineOpacity={0.5}
              >
                {project.tag.toUpperCase()}
              </Text>
            </>
          )}

          <mesh position={[0, -0.55, Z_EMBLEM]}>
            <torusGeometry args={[0.022, 0.005, 10, 28]} />
            <meshStandardMaterial
              color={palette.chrome}
              metalness={1}
              roughness={0.06}
              envMapIntensity={1.8}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, -0.55, Z_EMBLEM]}>
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
        {showPlayOverlay && !videoStarted && (
          <PlayOverlay
            accent={project.accent}
            title={project.title}
            projectId={project.id}
          />
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
  const setCardCount = useHubStore((s) => s.setCardCount);

  // In stack layout a showreel card is appended: the center pin is too small
  // and covered there to carry the play button. Last keeps project indexes.
  const withShowreel = layout === 'stack';
  const total = projects.length + (withShowreel ? 1 : 0);

  useEffect(() => {
    setCardCount(total);
  }, [total, setCardCount]);

  return (
    <group>
      {projects.map((p, i) => (
        <Cartouche
          key={p.id}
          project={p}
          index={i}
          total={total}
          hoverFXEnabled={hoverFXEnabled}
          orbitRadius={orbitRadius}
          cartoucheScale={cartoucheScale}
          layout={layout}
        />
      ))}
      {withShowreel && (
        <Cartouche
          key={showreelCard.id}
          project={showreelCard}
          index={showreelIndex}
          total={total}
          hoverFXEnabled={hoverFXEnabled}
          orbitRadius={orbitRadius}
          cartoucheScale={cartoucheScale}
          layout={layout}
          showreel
        />
      )}
    </group>
  );
}
