import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistMono.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
