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
      // Project uses API JSON shapes without full typings; warnings keep CI useful without blocking.
      "@typescript-eslint/no-explicit-any": "warn",
      // Legitimate data-fetch + reset patterns; flagging sync setState in effects is overly strict here.
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
