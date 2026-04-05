import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cineverse",
  description: "Your ultimate movie & TV show platform",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;