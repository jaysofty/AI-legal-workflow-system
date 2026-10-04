import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**", "src/assets/**"],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
        console: "readonly",
        fetch: "readonly",
        FormData: "readonly",
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
    },

    settings: {
      react: {
        version: "detect",
      },

      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
          moduleDirectory: ["node_modules", "src"],
        },
      },
    },

    rules: {
      "no-undef": "error",

      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],

      "no-console": "warn",

      "import/no-unresolved": [
        "error",
        {
          commonjs: true,
          amd: true,
          esmodule: true,
        },
      ],

      "import/named": "error",
      "import/no-duplicates": "error",

      "react/jsx-uses-vars": "error",
      "react/jsx-no-undef": "error",
      "react/prop-types": "off",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "react-refresh/only-export-components": "warn",
    },
  },

  {
    files: ["vite.config.js"],

    rules: {
      "import/no-unresolved": "off",
    },
  },
];
