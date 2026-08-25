import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
// import query from "@tanstack/eslint-plugin-query";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "coverage"] },

  // Config for JS files (like eslint.config.js) without TypeScript project service
  {
    files: ["*.js", "*.mjs"],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node,
    },
  },

  // Config for TS/TSX files with TypeScript project service
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },

  // ── LA REGLA DE DEPENDENCIA ───────────────────────────────────────────
  // El dominio es TypeScript puro: no conoce React, ni la librería HTTP, ni
  // la caché, ni las capas de fuera. Eso es lo que lo vuelve testeable sin
  // un solo doble de prueba.
  {
    files: ["src/domain/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-*",
                "axios",
                "@tanstack/*",
                "react-hook-form",
              ],
              message: "El dominio no depende de frameworks.",
            },
            {
              group: [
                "@/presentation/*",
                "@/infrastructure/*",
                "@/application/*",
              ],
              message: "Las dependencias apuntan hacia dentro.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/presentation/*", "@/infrastructure/*"],
              message:
                "La aplicación define interfaces; la infraestructura las implementa, no al revés.",
            },
            {
              group: ["axios", "react", "react-*"],
              message: "La aplicación no sabe cómo viajan los datos.",
            },
          ],
        },
      ],
    },
  },
  // La librería HTTP existe en UN solo directorio. Si aparece en otro, el
  // transporte dejó de ser sustituible.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/infrastructure/http/**"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "Solo src/infrastructure/http puede importar axios.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.spec.{ts,tsx}", "vitest.setup.ts"],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  prettier, // último siempre: apaga lo que Prettier decide
);
