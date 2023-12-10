module.exports = {
  root: true,
  extends: ['../../.eslintrc.json'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
