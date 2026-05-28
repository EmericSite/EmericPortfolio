import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Règles "React Compiler" (eslint-plugin-react-hooks v6). Le compiler n'est
    // pas activé (cf. next.config.ts) et ces règles produisent des faux positifs
    // massifs sur react-three-fiber, dont le modèle impératif mute volontairement
    // les objets three.js dans useFrame (caméra, matériaux, géométries) — un
    // pattern non corrigeable côté code. On les désactive (immutability/purity)
    // ou on les rétrograde en avertissement (refs/set-state-in-effect).
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
