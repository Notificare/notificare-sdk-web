/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = require("next-pwa")({
  dest: "public",
  register: false,
});

module.exports = withPWA(nextConfig);
