"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePetContract } from "@/hooks/usePetContract";
import type { PetData } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "My Pet", icon: "🐱" },
  { href: "/dashboard", label: "Quests", icon: "📋" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
];

/**
 * Dashboard sol paneli — profil özeti + navigasyon menüsü.
 * (Faz1 iskelet: statik profil placeholder; Faz2'de on-chain veriyle dolacak.)
 */
export function Sidebar() {
  const pathname = usePathname();
  const { hasPet, pet } = usePetContract();
  const petData = pet as PetData | undefined;
  const name = hasPet && petData?.name ? petData.name : "No pet";
  const level = hasPet && petData ? `Lv.${petData.level.toString()}` : "—";

  return (
    <aside className="glass-card flex w-64 flex-col gap-6 p-5">
      {/* Profil özeti */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-3xl">
          🐱
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-[var(--text-secondary)]">{level}</p>
        </div>
      </div>

      <hr className="border-[var(--glass-border)]" />

      {/* Navigasyon */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[rgba(59,130,246,0.15)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
