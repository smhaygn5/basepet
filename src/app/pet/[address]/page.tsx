"use client";

import { useParams } from "next/navigation";
import { useChainId, useReadContract } from "wagmi";
import { PET_CORE_ADDRESS, petCoreAbi } from "@/lib/contracts";
import { ShareButton } from "@/components/web3/ShareButton";
import { PetSprite } from "@/components/pet/PetSprite";
import type { PetData } from "@/types";

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const ZERO = "0x0000000000000000000000000000000000000000";

/**
 * Arkadaş ziyareti (plan §5.4) — başka bir adresin kedisini salt okunur görüntüler.
 */
export default function VisitPetPage() {
  const params = useParams<{ address: string }>();
  const addr = params?.address;
  const valid = typeof addr === "string" && ADDR_RE.test(addr);
  const chainId = useChainId();
  const contractAddress = PET_CORE_ADDRESS[chainId];
  const deployed = Boolean(contractAddress && contractAddress !== ZERO);

  const { data } = useReadContract({
    address: contractAddress,
    abi: petCoreAbi,
    functionName: "getPet",
    args: valid ? [addr as `0x${string}`] : undefined,
    query: { enabled: valid && deployed },
  });
  const pet = data as PetData | undefined;
  const exists = pet && Number(pet.createdAt) > 0;

  if (!valid) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-24">
        <p className="text-sm text-[var(--accent-red)]">Geçersiz adres.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {exists ? `${pet!.name} ziyareti` : "Kedi ziyareti"}
        </h1>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {addr.slice(0, 6)}…{addr.slice(-4)}
        </span>
      </div>

      {!deployed ? (
        <p className="text-sm text-[var(--accent-amber)]">
          Bu ağda PetCore deploy edilmemiş (yerel test için anvil / 31337).
        </p>
      ) : !exists ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Bu adresin henüz bir kedisi yok.
        </p>
      ) : (
        <>
          <div className="glass-card h-[420px] w-full overflow-hidden">
            <PetSprite animation="idle" />
          </div>
          <div className="glass-card flex items-center justify-between p-4">
            <div className="text-sm">
              <p className="font-semibold">{pet!.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Lv.{pet!.level.toString()} · {pet!.totalXP.toString()} XP
              </p>
            </div>
            <ShareButton
              text={`${pet!.name} adlı on-chain kedime göz at! 🐾 BasePet`}
              url={typeof window !== "undefined" ? window.location.href : undefined}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Salt okunur görünüm — bu kediyle etkileşemezsin.
          </p>
        </>
      )}
    </main>
  );
}
