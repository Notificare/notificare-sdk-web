/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: false,
});

module.exports = withPWA(nextConfig);
