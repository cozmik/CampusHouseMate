import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Vendor-style scaffolding the team never hand-writes: shadcn/ui kit under
  // libs/shared/ui. Linting it trips the build gate on noise (e.g.
  // no-explicit-any in generated components) and feeds an AI "fix" loop
  // against code that shouldn't change. Ignore wholesale; our own code in
  // apps/ and libs/shared stays fully linted.
  {
    ignores: [
      "dist",
      "**/node_modules/**",
      ".nx/**",
      "libs/shared/ui/**",
      "apps/**/e2e/**",
      "apps/**/playwright.config.ts",
      "playwright-report/**",
      "test-results/**",
      "apps/web/scripts/**",
      "apps/web/i18n.scan.json",
      "apps/web/reports/**",
      "apps/web/docs/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
