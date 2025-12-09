// ESLint Flat Config for Expo with ESLint 9
// Following Expo's recommended setup

const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');

// Spread the expo config array and add our customizations
module.exports = [
  // Spread Expo's flat config (it returns an array)
  ...expoConfig,

  // Prettier integration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },

  // TypeScript and custom rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      // TypeScript specific rules
      'no-unused-vars': 'off', // Must turn off base rule when using TypeScript version
      '@typescript-eslint/no-unused-vars': 'off', // Turn off in favor of unused-imports plugin

      // Unused imports plugin - auto-fixes unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Additional TypeScript rules for better type safety
      // '@typescript-eslint/no-explicit-any': 'warn', // Disabled for now
      // '@typescript-eslint/prefer-nullish-coalescing': 'warn',  // Disabled - requires type info (slow)
      '@typescript-eslint/no-non-null-assertion': 'warn', // Warn on ! assertions
    },
  },

  // Custom rules for all JS/TS files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Prevent dynamic imports (as per CLAUDE.md)
      'import/no-dynamic-require': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportExpression',
          message: 'Dynamic imports are not allowed. Use static imports instead.',
        },
        {
          selector: 'CallExpression[callee.name="require"][arguments.0.type!="Literal"]',
          message: 'Dynamic require() is not allowed. Use static imports instead.',
        },
      ],

      // Import ordering for React Native/Expo projects
      'import/order': [
        'warn',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // External packages (node_modules)
            'internal', // Internal aliases (~/...)
            'parent', // Parent imports (../)
            'sibling', // Sibling imports (./)
            'index', // Index imports
            'object', // Object imports
            'type', // Type imports
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            // React and React Native at the top of external
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-native',
              group: 'external',
              position: 'before',
            },
            // Expo packages after React
            {
              pattern: 'expo',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'expo-*',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@expo/**',
              group: 'external',
              position: 'before',
            },
            // Internal imports with alias
            {
              pattern: '~/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'react', 'react-native'],
          distinctGroup: true,
        },
      ],
      'import/first': 'warn', // All imports must be at the top
      'import/newline-after-import': 'warn', // Blank line after imports
      'import/no-duplicates': 'warn', // No duplicate imports

      // React Native specific - disabled because you use NativeWind/TypeScript
      'react-native/no-inline-styles': 'off',
      'react/prop-types': 'off',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error', // Enforce hooks rules
      'react-hooks/exhaustive-deps': 'off', // Disabled - too many intentional exclusions

      // React best practices
      'react/jsx-no-duplicate-props': 'error', // No duplicate props
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-key': 'error', // Require key prop in arrays
    },
  },

  // Node environment for config files
  {
    files: ['*.config.js', '*.config.cjs', 'scripts/**/*.js', 'metro.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        exports: 'writable',
        global: 'readonly',
        module: 'writable',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },

  // Additional ignore patterns (Expo config already includes some)
  {
    ignores: [
      '.idea/',
      'targets/',
      'documentation/',
      'node_modules/',
      '.history/',
      'dist/',
      '.claude/',
      '.expo/',
      '.maestro/',
      'targets/watch/',
    ],
  },
];
