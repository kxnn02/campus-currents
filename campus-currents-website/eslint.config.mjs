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
    rules: {
      // Downgrade to warn: the only place this fires is the canonical "mounted" pattern
      // in Animate.tsx (setState once on mount to gate client-only rendering and avoid
      // SSR hydration mismatch). That is idiomatic and correct, not a cascading-render
      // bug, so it should not block CI. Kept as a warning to stay visible.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
