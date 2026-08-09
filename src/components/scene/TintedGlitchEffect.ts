// Emericfolio — created by Tomi-Tom, 2026
// Neon glitch filter that splits the image into pink, cyan and red fringes

import { Effect } from 'postprocessing';
import * as THREE from 'three';

// Chromatic aberration with pink, cyan and red fringes instead of plain R/G/B.
// At offset=(0,0) every difference clamps to zero, so the input passes through.
const fragmentShader = /* glsl */ `
  uniform vec2 offset;
  uniform float strength;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 base = inputColor.rgb;

    vec3 sPink = texture2D(inputBuffer, uv + offset).rgb;
    vec3 sCyan = texture2D(inputBuffer, uv - offset).rgb;
    vec3 sRed  = texture2D(inputBuffer, uv + vec2(-offset.y, offset.x) * 0.7).rgb;

    vec3 dPink = max(vec3(0.0), sPink - base);
    vec3 dCyan = max(vec3(0.0), sCyan - base);
    vec3 dRed  = max(vec3(0.0), sRed  - base);

    const vec3 PINK = vec3(1.00, 0.18, 0.62); // #FF2D9C
    const vec3 CYAN = vec3(0.00, 0.94, 1.00); // #00F0FF
    const vec3 RED  = vec3(1.00, 0.20, 0.20);

    vec3 fringe = dPink * PINK + dCyan * CYAN + dRed * RED;

    outputColor = vec4(base + fringe * strength, inputColor.a);
  }
`;

export class TintedGlitchEffect extends Effect {
  constructor() {
    super('TintedGlitchEffect', fragmentShader, {
      uniforms: new Map<string, THREE.Uniform>([
        ['offset', new THREE.Uniform(new THREE.Vector2(0, 0))],
        ['strength', new THREE.Uniform(1.0)],
      ]),
    });
  }

  get offset(): THREE.Vector2 {
    return (this.uniforms.get('offset') as THREE.Uniform).value as THREE.Vector2;
  }

  get strength(): number {
    return (this.uniforms.get('strength') as THREE.Uniform).value as number;
  }

  set strength(value: number) {
    (this.uniforms.get('strength') as THREE.Uniform).value = value;
  }
}
