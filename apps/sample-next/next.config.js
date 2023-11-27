/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: false,
});

module.exports = withPWA(nextConfig);
