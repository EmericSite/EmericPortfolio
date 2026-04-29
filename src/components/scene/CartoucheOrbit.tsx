'use client';

import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import type { Group, MeshStandardMaterial } from 'three';
import { projects, type Project } from '@/data/projects';
import { useHubStore } from '@/store/hub';

const ORBIT_RADIUS = 2.95;
const ORBIT_TILT = 0.42;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Z = 0.8;
const ACTIVE_TARGET = new THREE.Vector3(0, 0.1, 1.8);
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
  const chromeMatRef = useRef<MeshStandardMaterial>(null);

  const setHovered = useHubStore((s) => s.setHovered);
  const setActive = useHubStore((s) => s.setActive);

  const angleOffset = (index / total) * Math.PI * 2;
  const orbitTarget = useRef(new THREE.Vector3());

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

    const targetScale = isActive ? 2.0 : isFocused ? 1.18 : 0.95;
    const s = THREE.MathUtils.lerp(innerRef.current.scale.x, targetScale, 0.08);
    innerRef.current.scale.setScalar(s);

    const targetEmissive = isFocused || isActive ? 0.55 : 0.16;
    const targetOpacity = isDimmed ? 0.05 : isOffstage ? 0.35 : 1;

    if (accentMatRef.current) {
      accentMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        accentMatRef.current.emissiveIntensity,
        targetEmissive,
        0.1,
      );
      accentMatRef.current.opacity = THREE.MathUtils.lerp(
        accentMatRef.current.opacity,
        targetOpacity,
        0.08,
      );
    }
    if (chromeMatRef.current) {
      chromeMatRef.current.opacity = THREE.MathUtils.lerp(
        chromeMatRef.current.opacity,
        targetOpacity,
        0.08,
      );
    }
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
            <meshStandardMaterial
              ref={chromeMatRef}
              color="#E8E6EC"
              metalness={1}
              roughness={0.06}
              envMapIntensity={1.6}
              transparent
              opacity={1}
            />
          </RoundedBox>

          {/* Accent body */}
          <RoundedBox
            args={[0.84, 1.22, 0.04]}
            radius={0.05}
            smoothness={5}
            position={[0, 0, 0.01]}
          >
            <meshStandardMaterial
              ref={accentMatRef}
              color={project.accent}
              emissive={project.accent}
              emissiveIntensity={0.18}
              metalness={0.45}
              roughness={0.4}
              transparent
              opacity={1}
            />
          </RoundedBox>

          <mesh position={[0, 0.5, 0.032]}>
            <planeGeometry args={[0.7, 0.008]} />
            <meshBasicMaterial color="#08070C" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.45, 0.032]}>
            <planeGeometry args={[0.7, 0.008]} />
            <meshBasicMaterial color="#08070C" toneMapped={false} />
          </mesh>

          <Text
            position={[-0.32, 0.41, 0.033]}
            fontSize={0.07}
            color="#08070C"
            anchorX="left"
            anchorY="middle"
            letterSpacing={0.08}
          >
            {`0${index + 1}`}
          </Text>
          <Text
            position={[0.32, 0.41, 0.033]}
            fontSize={0.06}
            color="#08070C"
            anchorX="right"
            anchorY="middle"
            letterSpacing={0.08}
          >
            {project.year}
          </Text>
          <Text
            position={[0, 0.02, 0.033]}
            fontSize={0.11}
            color="#08070C"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.72}
            textAlign="center"
            lineHeight={1.05}
          >
            {project.shortTitle}
          </Text>
          <Text
            position={[0, -0.36, 0.033]}
            fontSize={0.045}
            color="#08070C"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.16}
          >
            {project.tag.toUpperCase()}
          </Text>
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
