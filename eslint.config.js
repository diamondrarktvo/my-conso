const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
   expoConfig,
   {
      ignores: ['dist/*', 'node_modules/*', '.expo/*'],
   },
   {
      // i18next is used through its default instance on purpose (`i18next.t`, `.use`)
      rules: { 'import/no-named-as-default-member': 'off' },
   },
   {
      // Plain Node (CommonJS) scripts
      files: ['bin/**/*.js', 'scripts/**/*.js'],
      languageOptions: {
         sourceType: 'commonjs',
         globals: { __dirname: 'readonly', process: 'readonly', console: 'readonly', require: 'readonly' },
      },
   },
]);
