import { ReactNode } from "react";
import { GoogleMapsBootstrap } from "@/components/google-maps-bootstrap";

import "./globals.css";

export const metadata = {
  title: "Sample app",
  description: "Sample app used for testing the Notificare web libraries.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        {children}

        <GoogleMapsBootstrap />
      </body>
    </html>
  );
}
