module.exports = {
  root: true,
  extends: ['@notificare/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
};
