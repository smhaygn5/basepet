import type { Metadata } from "next";
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

const fcMiniApp = {
  version: "1",
  imageUrl: "https://basepet.app/og.png",
  button: {
    title: "Open BasePet",
    action: {
      type: "launch_frame",
      name: "BasePet",
      url: "https://basepet.app",
      splashImageUrl: "https://basepet.app/splash.png",
      splashBackgroundColor: "#0a0e1a",
    },
  },
};

export const metadata: Metadata = {
  title: "BasePet — On-chain 3D Pet on Base",
  description:
    "Feed, play, clean, and grow your 3D pet. Every care action becomes an on-chain memory on Base.",
  openGraph: {
    title: "BasePet — On-chain 3D Pet on Base",
    description:
      "Feed, play, clean, and grow your 3D pet. Every care action becomes an on-chain memory on Base.",
    images: ["https://basepet.app/og.png"],
  },
  other: {
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
