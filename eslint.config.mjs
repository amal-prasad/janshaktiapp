import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**", "render/**"] },
  {
    // Print components must emit a plain <img>: next/image lazy-loads and rewrites
    // URLs, which renders blank in the headless-Chromium PDF pass.
    files: ["src/components/blocks/**", "src/components/headers/**", "src/app/print/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
];
