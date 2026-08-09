// Emericfolio — created by Tomi-Tom, 2026
// Toolbox to list, fade, light up and frame the surfaces of the 3D objects

import * as THREE from 'three';
import type { Material, Texture } from 'three';

/** Per-frame opacity fade shared by the relic and the cartouches. */
export function fadeOpacity(
  mats: Material[],
  target: number,
  lerp: number,
): void {
  for (let i = 0; i < mats.length; i++) {
    const mat = mats[i];
    const next = THREE.MathUtils.lerp(mat.opacity, target, lerp);
    // Below that step the change is invisible and flipping transparent on
    // every material would cost a shader recompile for nothing.
    if (Math.abs(mat.opacity - next) > 0.001) {
      if (!mat.transparent) mat.transparent = true;
      mat.opacity = next;
    }
  }
}

/** Per-frame emissive ease; a no-op until the material ref is attached. */
export function easeEmissive(
  mat: { emissiveIntensity: number } | null,
  target: number,
  lerp: number,
): void {
  if (!mat) return;
  mat.emissiveIntensity = THREE.MathUtils.lerp(
    mat.emissiveIntensity,
    target,
    lerp,
  );
}

/** Crop the long side of a texture to the target aspect instead of stretching it. */
function coverFit(tex: Texture, targetAspect: number): void {
  const img = tex.image as { width?: number; height?: number } | undefined;
  if (!img?.width || !img?.height) return;
  const imgAspect = img.width / img.height;
  if (imgAspect > targetAspect) {
    const r = targetAspect / imgAspect;
    tex.repeat.set(r, 1);
    tex.offset.set((1 - r) / 2, 0);
  } else {
    const r = imgAspect / targetAspect;
    tex.repeat.set(1, r);
    tex.offset.set(0, (1 - r) / 2);
  }
}

/** Poster setup, to be called from the useTexture loader: mutating the value
 * returned by the hook is what react-hooks/immutability forbids. */
export function preparePosterTexture(
  loaded: Texture | Texture[],
  targetAspect: number,
): void {
  const tex = (Array.isArray(loaded) ? loaded[0] : loaded) as Texture;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  coverFit(tex, targetAspect);
  tex.needsUpdate = true;
}

/** Every material under an object, flattened, for a one-time cache. */
export function collectMaterials(root: THREE.Object3D | null): Material[] {
  const mats: Material[] = [];
  root?.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (m.isMesh && m.material) {
      const mat = m.material;
      if (Array.isArray(mat)) {
        for (const sub of mat) mats.push(sub);
      } else {
        mats.push(mat);
      }
    }
  });
  return mats;
}
