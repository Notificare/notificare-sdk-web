/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: false,
});

module.exports = withPWA(nextConfig);
