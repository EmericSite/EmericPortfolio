'use client';

import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Text, useTexture } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type {
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from 'three';
import { projects, type Project } from '@/data/projects';
import { useHubStore } from '@/store/hub';

const ORBIT_RADIUS = 2.3;
const ORBIT_TILT = 0.4;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Z = 0.8;
const ACTIVE_TARGET = new THREE.Vector3(0, 0.1, 1.5);
const ACTIVE_LOOK = new THREE.Vector3(0, 0.1, 4.6);
const LOOK_AT = new THREE.Vector3(0, 0, 1.2);

function Cartouche({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const groupRef = useRef<Group>(null);
  const innerRef = useRef<Group>(null);
  const accentMatRef = useRef<MeshStandardMaterial>(null);
  const chromeMatRef = useRef<MeshPhysicalMaterial>(null);

  const setHovered = useHubStore((s) => s.setHovered);
  const setActive = useHubStore((s) => s.setActive);

  const angleOffset = (index / total) * Math.PI * 2;
  const orbitTarget = useRef(new THREE.Vector3());

  // Load poster texture and apply imperatively (avoids RSC serialization)
  const tex = useTexture(project.posterUrl);
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    if (accentMatRef.current) {
      accentMatRef.current.map = tex;
      accentMatRef.current.needsUpdate = true;
    }
  }, [tex]);

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

    if (isActive) {
      groupRef.current.position.lerp(ACTIVE_TARGET, 0.06);
      groupRef.current.lookAt(ACTIVE_LOOK);
    } else {
      const angle = angleOffset + clock.elapsedTime * ORBIT_SPEED;
      orbitTarget.current.set(
        Math.cos(angle) * ORBIT_RADIUS,
        Math.sin(angle) * ORBIT_RADIUS * ORBIT_TILT,
        ORBIT_CENTER_Z + Math.sin(angle * 1.4) * 0.45,
      );
      groupRef.current.position.lerp(orbitTarget.current, 0.08);
      groupRef.current.lookAt(LOOK_AT);
    }

    const targetScale = isActive ? 1.5 : isFocused ? 1.18 : 0.95;
    const s = THREE.MathUtils.lerp(innerRef.current.scale.x, targetScale, 0.08);
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

    const targetOpacity = isDimmed ? 0.05 : isOffstage ? 0.4 : 1;
    innerRef.current.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as MeshStandardMaterial;
        if ('opacity' in mat) {
          mat.transparent = true;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.08);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
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
              <meshPhysicalMaterial
                color="#E8E6EC"
                metalness={1}
                roughness={0.04}
                clearcoat={1}
                clearcoatRoughness={0.05}
                envMapIntensity={2.2}
                transparent
                opacity={1}
              />
            </mesh>
          ))}

          {/* Poster panel — accent body with project image as map */}
          <RoundedBox
            args={[0.84, 1.22, 0.04]}
            radius={0.05}
            smoothness={5}
            position={[0, 0, 0.01]}
          >
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
          </RoundedBox>

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

          {/* Bottom info banner — dark gradient overlay for legibility */}
          <mesh position={[0, -0.36, 0.038]}>
            <planeGeometry args={[0.84, 0.5]} />
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
            <meshPhysicalMaterial
              color="#E8E6EC"
              metalness={1}
              roughness={0.06}
              clearcoat={1}
              envMapIntensity={1.8}
              transparent
              opacity={1}
            />
          </mesh>
          <mesh position={[0, -0.55, 0.05]}>
            <circleGeometry args={[0.012, 32]} />
            <meshStandardMaterial
              color={project.accent}
              emissive={project.accent}
              emissiveIntensity={1.6}
              toneMapped={false}
              transparent
              opacity={1}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function CartoucheOrbit() {
  return (
    <group>
      {projects.map((p, i) => (
        <Cartouche key={p.id} project={p} index={i} total={projects.length} />
      ))}
    </group>
  );
}
