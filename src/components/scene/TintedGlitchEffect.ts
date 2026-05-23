import { Effect } from 'postprocessing';
import * as THREE from 'three';

// Three-color glitch — like ChromaticAberration but the fringe samples are
// tinted pink, cyan, red instead of pure R/G/B. Output at offset=(0,0) is the
// untouched input (samples match base, all differences clamp to zero).
const fragmentShader = /* glsl */ `
  uniform vec2 offset;
  uniform float strength;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 base = inputColor.rgb;

    vec3 sPink = texture2D(inputBuffer, uv + offset).rgb;
    vec3 sCyan = texture2D(inputBuffer, uv - offset).rgb;
    // Third sample on the perpendicular axis, slightly attenuated
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
