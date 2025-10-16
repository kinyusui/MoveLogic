module.exports = {
  ignorePatterns: [".eslintrc.cjs", ".eslintrc.js"], // Exclude config files
  rules: {
    "prefer-const": "off",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"], // optional but recommended for type-aware rules
    sourceType: "module",
    ecmaVersion: 2020,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    // "plugin:@typescript-eslint/recommended"
  ],
  overrides: [
    {
      // Test files only
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      extends: ["plugin:testing-library/react"],
    },
    {
      // --- TEST FILE CONFIGURATION ---
      // Apply this configuration ONLY to files matching these glob patterns
      files: ["**/*.test.ts", "**/*.spec.ts"],

      parserOptions: {
        // IMPORTANT: Point to your test-specific tsconfig file
        project: ["./tsconfig.test.json"],
      },

      rules: {
        // You can relax or change rules specifically for test files here
        // For example, it's common to allow 'any' in test files.
        "@typescript-eslint/no-explicit-any": "off",

        // It's also common to have non-null assertions in tests.
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
  ],
  settings: {
    "import/resolver": {
      typescript: {},
    },
  },
};
