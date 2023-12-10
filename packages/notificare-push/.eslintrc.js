module.exports = {
  root: true,
  extends: ['../../configs/.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
