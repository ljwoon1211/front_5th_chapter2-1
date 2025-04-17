// eslint.config.js
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // 브라우저 전역 객체
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        alert: 'readonly', // alert 추가
        confirm: 'readonly', // 추가로 유용한 대화상자 함수들
        prompt: 'readonly', // 추가로 유용한 대화상자 함수
        // Vite 환경 특정 전역 변수
        import: 'readonly',
        'import.meta': 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Vite 설정 내에서 정의할 수 있는 사용자 정의 전역 변수
        __IS_BASIC__: 'readonly',
        __MODE__: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,

    },
    rules: {
      'prettier/prettier': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'warn',
    },
    ignores: ['dist/**', 'node_modules/**', '.vite/**', 'public/**'],
  },
];
