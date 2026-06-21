import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const APP_URL = "https://basepet-one.vercel.app";

const fcMiniApp = {
  version: "1",
  imageUrl: `${APP_URL}/og.png`,
  button: {
    title: "Open BasePet",
    action: {
      type: "launch_frame",
      name: "BasePet",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0a0e1a",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0a0e1a",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "BasePet — On-chain 3D Pet on Base",
  description:
    "Feed, play, clean, and grow your 3D pet. Every care action becomes an on-chain memory on Base.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: "BasePet — On-chain 3D Pet on Base",
    description:
      "Feed, play, clean, and grow your 3D pet. Every care action becomes an on-chain memory on Base.",
    url: APP_URL,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasePet — On-chain 3D Pet on Base",
    description: "Feed, play, clean, and grow your 3D pet on Base.",
    images: ["/og.png"],
  },
  other: {
    // base.dev domain doğrulaması
    "base:app_id": "6a37dc5474397a1da4f7aa81",
    // Farcaster Mini App embed (Warpcast önizleme)
    "fc:miniapp": JSON.stringify(fcMiniApp),
    "fc:frame": JSON.stringify(fcMiniApp), // geriye dönük uyumluluk
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Web3Provider>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
        </Web3Provider>
      </body>
    </html>
  );
}
