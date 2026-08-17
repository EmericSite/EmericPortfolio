// Emericfolio — created by Tomi-Tom, 2026
// Where each project card sits, how big it is and how it faces the viewer

import * as THREE from 'three';
import type { Group } from 'three';
import type { CartoucheLayout } from '@/lib/useViewportScale';

const ORBIT_TILT = 0.42;
const ORBIT_SPEED = 0.06;
const ORBIT_CENTER_Z = 0.8;
// Depth follows -cos(angle): the parallax is symmetric left/right and periodic,
// and stays a constant share of the radius at every breakpoint.
const ORBIT_DEPTH_RATIO = 0.15;
// Horizontal gap in the mobile stack, wide enough that neighbours do not overlap.
const STACK_GAP_X = 1.15;
const STACK_SCALE_RATIO = 1.33;

/** Golden angle: desyncs each card's breathing, angular spacing stays even. */
export const GOLDEN_ANGLE = 2.399963229728653; // 137.5078° in radians

const ACTIVE_TARGET = new THREE.Vector3(-0.7, 0, 1.6);
const ACTIVE_LOOK = new THREE.Vector3(0, 0, 4.6);
const LOOK_AT = new THREE.Vector3(0, 0, 1.2);

// How far the card turns toward the camera on hover: 0 keeps the orbit
// orientation, 1 faces the viewer fully.
export const HOVER_FACE_AMOUNT = 0.4;

/** Angular slot of a card on the orbit. */
export function orbitAngleOffset(index: number, total: number): number {
  return (index / total) * Math.PI * 2;
}

/** Fly-in depth: each card starts further back so they arrive staggered. */
export function flyInZ(index: number): number {
  return -8 - index * 4;
}

/** Stack slot for an offset in cards from the center. */
function setStackTarget(target: THREE.Vector3, offset: number): THREE.Vector3 {
  const abs = Math.abs(offset);
  // 1 exactly at the center, 0 one card away.
  const frontWeight = Math.max(0, 1 - abs);
  // Constant gap: the first step must not feel bigger than the next ones.
  return target.set(
    STACK_GAP_X * offset,
    -abs * 0.05,
    ORBIT_CENTER_Z + 0.4 * frontWeight - 0.28 * abs,
  );
}

/** Orbit slot at the given elapsed time. */
function setOrbitTarget(
  target: THREE.Vector3,
  angleOffset: number,
  elapsed: number,
  orbitRadius: number,
): THREE.Vector3 {
  const rawAngle = angleOffset + elapsed * ORBIT_SPEED;
  const SPREAD = 0.15;
  const angle = rawAngle + SPREAD * Math.sin(2 * rawAngle);
  return target.set(
    Math.cos(angle) * orbitRadius,
    Math.sin(angle) * orbitRadius * ORBIT_TILT,
    ORBIT_CENTER_Z - Math.cos(angle) * orbitRadius * ORBIT_DEPTH_RATIO,
  );
}

/** Geometric size ratio rather than a linear falloff: already 1.4 at abs 0, so
 * the card grows smoothly as it recenters, with no special case. */
function stackScale(abs: number): number {
  return Math.max(0.45, 1.4 / Math.pow(STACK_SCALE_RATIO, abs));
}

/** 1 at the center so a card landing there does not pop. */
function stackFade(abs: number): number {
  return Math.max(0.25, 1 - abs * 0.3);
}

// The three placements below all write the position then the orientation, in
// that order: the hover slerp that follows them overwrites the orientation.

/** Reading pose of the opened card, off to the side of the panel. */
export function placeActive(group: Group, lerp: number): void {
  group.position.lerp(ACTIVE_TARGET, lerp);
  group.lookAt(ACTIVE_LOOK);
}

/** Stack slot, sticking to the finger while dragging and easing back otherwise. */
export function placeStacked(
  group: Group,
  target: THREE.Vector3,
  cameraPos: THREE.Vector3,
  offset: number,
  dragOffset: number,
  lerp: number,
): void {
  setStackTarget(target, offset);
  group.position.lerp(target, dragOffset !== 0 ? 0.45 : lerp);
  // Look at the camera so the centered card always faces the viewer, whatever
  // the orbit angle.
  group.lookAt(cameraPos);
}

/** Orbit slot at the given elapsed time. */
export function placeOnOrbit(
  group: Group,
  target: THREE.Vector3,
  angleOffset: number,
  elapsed: number,
  orbitRadius: number,
  lerp: number,
): void {
  setOrbitTarget(target, angleOffset, elapsed, orbitRadius);
  group.position.lerp(target, lerp);
  group.lookAt(LOOK_AT);
}

/** Scratch quaternions for the hover blend, one pair per card, allocated once
 * rather than on every frame. */
export type QuatPair = { base: THREE.Quaternion; face: THREE.Quaternion };
export function newQuatPair(): QuatPair {
  return { base: new THREE.Quaternion(), face: new THREE.Quaternion() };
}

/** Blend the placement orientation with facing the camera: keeps the hover turn
 * light wherever the camera sits. Overwrites what the placement just wrote. */
export function slerpTowardCamera(
  group: Group,
  quats: QuatPair,
  amount: number,
  cameraPos: THREE.Vector3,
): void {
  quats.base.copy(group.quaternion);
  group.lookAt(cameraPos);
  quats.face.copy(group.quaternion);
  group.quaternion.slerpQuaternions(quats.base, quats.face, amount);
}

/** Size of a card: opened, stacked by distance to the center, or focused. */
export function targetCardScale(
  isActiveCard: boolean,
  layout: CartoucheLayout,
  stackAbs: number,
  isFocused: boolean,
): number {
  if (isActiveCard) return 1.5;
  if (layout === 'stack') return stackScale(stackAbs);
  return isFocused ? 1.12 : 0.95;
}

/** Opacity of a card: dimmed behind an open panel, pushed back offstage, or
 * faded by its distance to the center of the stack. */
export function targetCardOpacity(
  isDimmed: boolean,
  isOffstage: boolean,
  layout: CartoucheLayout,
  stackAbs: number,
): number {
  if (isDimmed) return 0.05;
  if (isOffstage) return 0.4;
  return layout === 'stack' ? stackFade(stackAbs) : 1;
}
