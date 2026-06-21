"use client";

import { useEffect, useState } from "react";
import { base } from "wagmi/chains";
import { usePublicClient } from "wagmi";
import { getAbiItem } from "viem";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { PET_CORE_ADDRESS, PET_CORE_FROM_BLOCK, petCoreAbi } from "@/lib/contracts";

interface Row {
  address: `0x${string}`;
  petName: string;
  totalXP: number;
  level: number;
}

// Public RPC eth_getLogs'u 10.000 blokla sınırlar → güvenli tarafta 9.000.
const CHUNK = 9000n;
const CACHE_KEY = "basepet:leaderboard:v1";

interface Cache {
  owners: string[];
  toBlock: string;
}

export default function LeaderboardPage() {
  const client = usePublicClient({ chainId: base.id });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    let active = true;

    (async () => {
      try {
        const address = PET_CORE_ADDRESS[base.id];
        const fromDeploy = PET_CORE_FROM_BLOCK[base.id] ?? 0n;

        // localStorage cache: daha önce bulunan sahipler + son taranan blok.
        // Böylece her ziyarette yalnızca yeni bloklar taranır (hızlı + RPC dostu).
        let owners = new Set<string>();
        let scannedTo = fromDeploy - 1n;
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const c = JSON.parse(raw) as Cache;
            if (Array.isArray(c.owners)) owners = new Set(c.owners);
            if (typeof c.toBlock === "string") scannedTo = BigInt(c.toBlock);
          }
        } catch {
          // bozuk cache → sıfırdan tara
        }

        const latest = await client.getBlockNumber();
        const event = getAbiItem({ abi: petCoreAbi, name: "PetCreated" });

        let from = scannedTo + 1n;
        if (from < fromDeploy) from = fromDeploy;

        while (from <= latest) {
          const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;
          const logs = await client.getLogs({ address, event, fromBlock: from, toBlock: to });
          for (const log of logs) {
            const owner = (log.args as { owner?: string }).owner;
            if (owner) owners.add(owner.toLowerCase());
          }
          from = to + 1n;
        }

        try {
          const cache: Cache = { owners: [...owners], toBlock: latest.toString() };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch {
          // quota vs. → cache atla
        }

        const ownerList = [...owners] as `0x${string}`[];
        if (ownerList.length === 0) {
          if (active) {
            setRows([]);
            setLoading(false);
          }
          return;
        }

        // Tüm pet verilerini tek multicall ile oku (Base multicall3).
        const results = await client.multicall({
          allowFailure: true,
          contracts: ownerList.map(
            (o) =>
              ({
                address,
                abi: petCoreAbi,
                functionName: "getPet",
                args: [o],
              }) as const,
          ),
        });

        const list: Row[] = [];
        results.forEach((r, i) => {
          if (r.status !== "success") return;
          const p = r.result as {
            name: string;
            totalXP: bigint;
            level: bigint;
            createdAt: bigint;
          };
          if (!p || p.createdAt === 0n) return;
          list.push({
            address: ownerList[i],
            petName: p.name,
            totalXP: Number(p.totalXP),
            level: Number(p.level),
          });
        });
        list.sort((a, b) => b.totalXP - a.totalXP);

        if (active) {
          setRows(list.slice(0, 50));
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : "Failed to load rankings");
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [client]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Leaderboard
        </h1>
      </div>
      <p className="-mt-3 text-sm text-[var(--text-secondary)]">
        Top players by total XP — live, on-chain on Base.
      </p>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading on-chain rankings…</p>
      ) : error ? (
        <div className="glass-card flex flex-col gap-2 p-6 text-sm">
          <p className="text-[var(--accent-amber)]">Couldn&apos;t load rankings.</p>
          <p className="text-xs text-[var(--text-muted)]">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-card flex flex-col gap-2 p-6 text-sm text-[var(--text-secondary)]">
          <p>No players yet.</p>
          <p className="text-xs text-[var(--text-muted)]">
            Adopt a pet and care for it to claim the #1 spot.
          </p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-[var(--glass-border)] p-2">
          {rows.map((r, i) => (
            <div key={r.address} className="flex items-center gap-3 p-3">
              <span
                className={`w-7 text-center font-bold ${
                  i === 0
                    ? "text-[var(--accent-amber)]"
                    : i < 3
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                }`}
              >
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </span>
              <Avatar address={r.address} chain={base} className="h-8 w-8" />
              <div className="flex flex-1 flex-col">
                <Name address={r.address} chain={base} className="text-sm" />
                <span className="text-xs text-[var(--text-muted)]">🐱 {r.petName}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--accent-amber)]">
                {r.totalXP.toLocaleString()} XP
              </span>
              <span className="w-12 text-right text-xs text-[var(--text-secondary)]">
                Lv.{r.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
