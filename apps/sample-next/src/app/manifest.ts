import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sample app",
    short_name: "Sample app",
    description: "Sample app used for testing the Notificare web libraries.",
    start_url: "/",
    display: "standalone",
    background_color: "#2B42F7",
    theme_color: "#2B42F7",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "icons/icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
