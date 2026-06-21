"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { MobileNav } from "./MobileNav";

/**
 * Üst navigasyon — glassmorphic bar.
 * Logo + linkler + RainbowKit Connect Wallet butonu.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)] px-6 py-3">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="flex cursor-pointer select-none items-center gap-2 text-xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span>🐾</span>
          <span>BasePet</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            About
          </Link>
          <Link
            href="/dashboard"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Dashboard
          </Link>
          <Link
            href="/leaderboard"
            className="text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Leaderboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
          />
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
