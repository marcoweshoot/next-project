// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Cartelle da ignorare
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
    ],
  },
  // Regole per TS/TSX
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // set base rules TS
      // Se vuoi più rigore con type-check, valuta:
      // ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      // Se usi recommendedTypeChecked, abilita il progetto:
      // parserOptions: { project: ['./tsconfig.json'] },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Hook: lasciamo gli errori perché sono bug veri
      ...reactHooks.configs.recommended.rules, // rules-of-hooks & exhaustive-deps
      // Fast Refresh: solo warning
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // ✅ Ammorbidimenti per sbloccare i build
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);
