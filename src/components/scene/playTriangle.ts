import * as THREE from 'three';

/**
 * Triangle de lecture en géométrie, partagé par le bouton du pin et celui de
 * la cartouche showreel. Préféré à une texture ou à du HTML : net à toute
 * distance, sans fichier à charger, et il suit la perspective de la scène.
 *
 * Rayon utile ≈ 0.16. Les sommets sont décalés vers la gauche pour que le
 * centre de masse tombe sur l'origine : centré géométriquement, un triangle
 * pointant à droite paraît collé au bord droit de son rond.
 */
export const PLAY_TRIANGLE = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.09, 0.15);
  s.lineTo(0.16, 0);
  s.lineTo(-0.09, -0.15);
  s.closePath();
  return new THREE.ShapeGeometry(s);
})();
