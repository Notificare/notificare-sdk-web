module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
    "airbnb-base",
    "airbnb-typescript/base",
  ],
  rules: {
    "import/prefer-default-export": "off", // prefer named to default exports
  },
};
