// Emericfolio — created by Tomi-Tom, 2026
// Shapes cut once for a project card: poster, title band, chips and their depths

import * as THREE from 'three';

/** Rounded rect centered on the origin, every corner at radius r. */
function makeRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const x = w / 2;
  const y = h / 2;
  const s = new THREE.Shape();
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  return s;
}

const POSTER_W = 0.84;
const POSTER_H = 1.22;
const POSTER_R = 0.05;

/** Ratio of the poster face, used to cover-fit the texture onto it. */
export const POSTER_ASPECT = POSTER_W / POSTER_H;

// Flat rounded-rect for the poster face: a 2D shape so the texture is never
// wrapped over depth, with UVs remapped to 0-1 so cover-fit repeat/offset works.
export const POSTER_GEOMETRY = (() => {
  const geo = new THREE.ShapeGeometry(
    makeRoundedRectShape(POSTER_W, POSTER_H, POSTER_R),
    8,
  );
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

// Title band: narrower than the poster, bottom corners at the poster radius so
// the arcs never stick out. Top corners are square, hidden by the fade.
const BAND_W = 0.8;
const BAND_H = 0.5; // height of the fade zone
const BAND_R = POSTER_R;
export const BAND_CENTER_Y = -0.36; // bottom edge lands on the poster bottom edge

// Bottom corners rounded like the poster, top corners square. The vertex RGBA
// gradient is baked once here; rendered alpha is vertexAlpha × material.opacity.
export const BANNER_GEOMETRY = (() => {
  const w = BAND_W / 2;
  const h = BAND_H / 2;
  const r = BAND_R;
  const s = new THREE.Shape();
  s.moveTo(-w + r, -h);
  s.lineTo(w - r, -h);
  s.quadraticCurveTo(w, -h, w, -h + r);
  s.lineTo(w, h);
  s.lineTo(-w, h);
  s.lineTo(-w, -h + r);
  s.quadraticCurveTo(-w, -h, -w + r, -h);
  const geo = new THREE.ShapeGeometry(s, 16);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 4);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y + BAND_H / 2) / BAND_H;
    // Stay close to opaque so the band still reads as black at the top.
    const a = 0.95 - 0.28 * t;
    colors[i * 4 + 0] = 1; // white vertex color, material.color does the tinting
    colors[i * 4 + 1] = 1;
    colors[i * 4 + 2] = 1;
    colors[i * 4 + 3] = a;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  return geo;
})();

const CHIP_R = 0.018;
export const CHIP_INDEX_GEOMETRY = new THREE.ShapeGeometry(
  makeRoundedRectShape(0.14, 0.075, CHIP_R),
  8,
);
export const CHIP_YEAR_GEOMETRY = new THREE.ShapeGeometry(
  makeRoundedRectShape(0.18, 0.075, CHIP_R),
  8,
);

// Fixed z planes above the poster (0.026). Kept tight so the overlays look
// printed on the poster instead of floating over it, and z and renderOrder must
// stay in step with the meshes in CartoucheOrbit.
export const Z_BANNER = 0.0285;
export const Z_CHIP = 0.029;
export const Z_TEXT = 0.0315;
export const Z_EMBLEM = 0.034;
