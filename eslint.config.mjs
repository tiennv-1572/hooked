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
    // Admin guide: fumadocs-mdx output and the screenshot stack's copy of the repo (scripts/huong-dan/stack.sh).
    ".source/**",
    ".huong-dan-stack/**",
  ]),
]);

export default eslintConfig;
