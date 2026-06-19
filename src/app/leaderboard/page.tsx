"use client";

import { useEffect, useState } from "react";
import { base } from "wagmi/chains";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { supabase } from "@/lib/supabase";

interface Row {
  wallet_address: string;
  total_xp: number;
  level: number;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("leaderboard")
        .select("wallet_address,total_xp,level")
        .order("total_xp", { ascending: false })
        .limit(20);
      if (active) {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Liderlik Tablosu
        </h1>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : rows.length === 0 ? (
        <div className="glass-card flex flex-col gap-2 p-6 text-sm text-[var(--text-secondary)]">
          <p>Henüz sıralama verisi yok.</p>
          <p className="text-xs text-[var(--text-muted)]">
            Canlı sıralama, Supabase + Ponder indexer bağlandığında dolar (haftalık XP).
            Basenames (user.base.eth) ile gösterilir.
          </p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-[var(--glass-border)] p-2">
          {rows.map((r, i) => (
            <div key={r.wallet_address} className="flex items-center gap-3 p-3">
              <span className="w-6 text-center font-bold text-[var(--text-secondary)]">
                {i + 1}
              </span>
              <Avatar
                address={r.wallet_address as `0x${string}`}
                chain={base}
                className="h-8 w-8"
              />
              <Name
                address={r.wallet_address as `0x${string}`}
                chain={base}
                className="flex-1 text-sm"
              />
              <span className="text-sm font-semibold text-[var(--accent-amber)]">
                {r.total_xp} XP
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Lv.{r.level}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
