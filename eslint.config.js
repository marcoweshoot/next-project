// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  // Ignora build/cache e il file generato da Next (next-env.d.ts)
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "out",
      ".vercel",
      ".turbo",
      "coverage",
      "public/build",
      "next-env.d.ts", // <-- evita l'errore sulle triple-slash reference
    ],
  },

  // Base comune (plugin e language options) per TS/JS
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
  },

  // Regole per TypeScript / TSX
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // Per regole type-aware (più lente):
      // ...tseslint.configs.recommendedTypeChecked,
    ],
    rules: {
      // Applico le regole Core Web Vitals di Next senza usare extends legacy
      ...(nextPlugin.configs["core-web-vitals"]?.rules ?? {}),

      // Hook: error (bug reali)
      ...reactHooks.configs.recommended.rules,

      // Fast Refresh: solo warning
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Ammorbidimenti
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Regole per JavaScript / JSX (se presenti file JS)
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended],
    rules: {
      ...(nextPlugin.configs["core-web-vitals"]?.rules ?? {}),
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  }
);
