module.exports = {
  ignorePatterns: [".eslintrc.cjs", ".eslintrc.js"], // Exclude config files
  rules: {
    "prefer-const": "off",
    "require-await": "error", // Don't use async without await
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json", // optional but recommended for type-aware rules
    sourceType: "module",
    ecmaVersion: 2020,
  },
  plugins: ["@typescript-eslint"],
  extends: ["plugin:@typescript-eslint/recommended"],
  overrides: [
    {
      // Test files only
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      extends: ["plugin:testing-library/react"],
    },
  ],
};
