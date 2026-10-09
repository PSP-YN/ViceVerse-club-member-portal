import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Bebas_Neue, Rajdhani } from "next/font/google";
import "./globals.css";

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
  preload: false,
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gta-display",
  display: "swap",
  preload: true,
});

const rajdhani = Rajdhani({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-gta-hud",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#090514",
};

export const metadata: Metadata = {
  title: {
    default: "VICEVERSE // Club Member Ops Portal",
    template: "%s | VICEVERSE",
  },
  description:
    "ViceVerse Ideathon Club Member Operations — GTA VI themed portal for Team QR scanning, manual ID lookup, member verification, and distribution tracking.",
  keywords: ["ViceVerse", "Ideathon", "Club Member", "Event Operations", "GTA Vice City"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} ${rajdhani.variable} antialiased min-h-screen text-slate-100 selection:bg-pink-500/30 selection:text-cyan-300`}
      >
        {children}
      </body>
    </html>
  );
}
