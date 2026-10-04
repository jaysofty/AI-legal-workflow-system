import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: [
      "node_modules/**",
      "src/generated/**",
      "uploads/**",
      "prisma/migrations/**",
    ],
  },

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  js.configs.recommended,

  {
    plugins: {
      import: importPlugin,
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".mjs"],
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
        },
      ],

      "import/no-unresolved": [
        "error",
        {
          commonjs: true,
          amd: true,
          esmodule: true,
          ignore: ["^dotenv/config$", "^\\.\\./src/generated/prisma/"],
        },
      ],
      "import/named": "error",

      "no-console": "off",
    },
  },
];
