// ESLint : règles recommandées de Next.js (React, accessibilité, Core Web Vitals) + TypeScript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ["node_modules/**", ".next/**", ".next-*/**", "public/**", "next-env.d.ts", "coverage/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // variables préfixées par _ : volontairement inutilisées
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  // fichiers de configuration en CommonJS (next.config.js, jest.config.js…)
  { files: ["*.js"], rules: { "@typescript-eslint/no-require-imports": "off" } },
];

export default config;
