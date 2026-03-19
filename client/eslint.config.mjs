import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**'],
  },
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Remove unused imports
      'unused-imports/no-unused-imports': 'error',

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Strict rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],

      // React
      'react/react-in-jsx-scope': 'off',
    },
  },
  prettierConfig,
];
