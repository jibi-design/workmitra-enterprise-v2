import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'android', 'ios']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // STEP 4 — Strict Module Isolation: Employee ↔ Employer must not cross-import.
  {
    files: ['src/features/employee/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/employer/**'],
              message:
                'Employee → Employer forbidden. Use shared/, features/shared/, or features/career/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/employer/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/employee/**'],
              message:
                'Employer → Employee forbidden. Use shared/ or features/shared/ adapters.',
            },
          ],
        },
      ],
    },
  },
  // Hybrid A2 S3 — Planner must not import shiftJobs directly (use ports).
  {
    files: [
      'src/features/employer/planner/**/*.{ts,tsx}',
      'src/features/employee/planner/**/*.{ts,tsx}',
    ],
    ignores: [],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/shiftJobs/**', '**/features/**/shiftJobs/**'],
              message:
                'Hybrid A2: import Shift only via features/shared/planner/ports/* (ExecutionPort or LegacyShiftBridge).',
            },
          ],
        },
      ],
    },
  },
])
