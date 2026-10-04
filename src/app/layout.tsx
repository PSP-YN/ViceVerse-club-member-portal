import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Use Next.js built-in font optimization — zero render blocking, self-hosted
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // Only loaded when needed (code/IDs)
});

export const viewport: Viewport = {
  themeColor: "#0E0F14",
};

export const metadata: Metadata = {
  title: {
    default: "ViceVerse | Club Member Portal",
    template: "%s | ViceVerse",
  },
  description:
    "ViceVerse Ideathon Club Member Portal — manage event-day operations, QR scanning, team registration, and distribution tracking.",
  keywords: ["ViceVerse", "Ideathon", "Club Member", "Event Operations"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
