"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sidebar } from "@/components/layout/Sidebar";
import { NeedBar } from "@/components/ui/NeedBar";
import { XPPopup } from "@/components/ui/XPPopup";
import { PetActions } from "@/components/web3/PetActions";
import { TxStatusOverlay, type TxStatus } from "@/components/web3/TxStatusOverlay";
import { DailyQuests } from "@/components/game/DailyQuests";
import { StreakWidget } from "@/components/game/StreakWidget";
import { LevelBadge } from "@/components/game/LevelBadge";
import { ReferralCard } from "@/components/game/ReferralCard";
import { ShareButtons } from "@/components/web3/ShareButton";
import { PetSprite } from "@/components/pet/PetSprite";
import { GameArcade } from "@/components/games/GameArcade";
import { usePetContract } from "@/hooks/usePetContract";
import { useNeedBars } from "@/hooks/useNeedBars";
import { usePetAnimation } from "@/hooks/usePetAnimation";
import { useStreak } from "@/hooks/useStreak";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { ActionType, petCoreAbi } from "@/lib/contracts";
import { BASE_XP_PER_ACTION } from "@/lib/constants";
import type { NeedType, PetAnimationState, PetData } from "@/types";

const ZERO = "0x0000000000000000000000000000000000000000";
const ACTION_ANIM: Record<ActionType, PetAnimationState> = {
  [ActionType.FEED]: "eat",
  [ActionType.PLAY]: "play",
  [ActionType.SLEEP]: "sleep",
  [ActionType.BATH]: "bath",
  [ActionType.TOILET]: "toilet",
};
const NEEDS: NeedType[] = ["hunger", "fun", "sleep", "toilet", "clean"];

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { contractAddress, hasPet, pet, createPet, refetch } = usePetContract();
  const petData = pet as PetData | undefined;

  const { animation, trigger } = usePetAnimation();
  const bars = useNeedBars(petData);

  // İhtiyaç-bazlı ruh hali: boştayken bir ihtiyaç düşükse (aç/uykulu/pis) idle yerine sad.
  // Action animasyonları (eat/play/happy...) önceliklidir.
  const lowNeed = Object.values(bars).some((v) => v < 30);
  const displayAnimation: PetAnimationState =
    animation === "idle" ? (lowNeed ? "sad" : "idle") : animation;
  const streak = useStreak(address);
  const { quests, recordAction: recordQuest, recordWin } = useDailyQuests();

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [xp, setXp] = useState<number | null>(null);
  const [petName, setPetName] = useState("");
  const [arcadeOpen, setArcadeOpen] = useState(false);

  const deployed = Boolean(contractAddress && contractAddress !== ZERO);

  /** TX gönder + receipt'i bekle; başarılıysa true döner. Durum güncellemeleri handler içinde. */
  async function runTx(
    hashPromise: Promise<`0x${string}`>,
    opts: { confirmAnim?: PetAnimationState; awardXp?: boolean; onConfirmed?: () => void } = {},
  ): Promise<boolean> {
    setTxStatus("pending");
    try {
      const hash = await hashPromise;
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("reverted");

      setTxStatus("confirmed");
      if (opts.awardXp) setXp(BASE_XP_PER_ACTION);
      if (opts.confirmAnim) trigger(opts.confirmAnim);
      opts.onConfirmed?.();
      refetch();
      setTimeout(() => setXp(null), 1400);
      setTimeout(() => setTxStatus("idle"), 900);
      return true;
    } catch {
      setTxStatus("error");
      trigger("sad");
      setTimeout(() => setTxStatus("idle"), 2500);
      return false;
    }
  }

  function handleAction(action: ActionType) {
    if (!deployed || !publicClient) return;
    // Play artık doğrudan tx atmaz → arcade'i açar (oyunlar içinde tx atılır).
    if (action === ActionType.PLAY) {
      setArcadeOpen(true);
      return;
    }
    trigger(ACTION_ANIM[action]); // optimistic animasyon
    void runTx(
      writeContractAsync({
        address: contractAddress,
        abi: petCoreAbi,
        functionName: "performAction",
        args: [action],
      }),
      {
        confirmAnim: "happy",
        awardXp: true,
        onConfirmed: () => {
          recordQuest(action);
          streak.recordAction();
        },
      },
    );
  }

  /** Arcade oyunları için: PLAY tx'i gönder, başarı durumunu döndür (oyun sonucu için). */
  function playGameTx(): Promise<boolean> {
    if (!deployed || !publicClient) return Promise.resolve(false);
    trigger("play");
    return runTx(
      writeContractAsync({
        address: contractAddress,
        abi: petCoreAbi,
        functionName: "performAction",
        args: [ActionType.PLAY],
      }),
      {
        confirmAnim: "happy",
        awardXp: true,
        onConfirmed: () => {
          recordQuest(ActionType.PLAY);
          streak.recordAction();
        },
      },
    );
  }

  function handleCreate() {
    if (!deployed || !publicClient || !petName.trim()) return;
    void runTx(createPet(petName.trim()), { confirmAnim: "happy" });
  }

  const showActions = isConnected && deployed && hasPet;

  // Cüzdan bağlı değilse dashboard içeriği gösterilmez — sadece bağlanma kapısı.
  if (!isConnected) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 py-24 text-center">
        <span className="text-5xl">🐾</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Connect your wallet to play
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          BasePet is an on-chain game. You need a wallet on the Base network to
          create and take care of your pet.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 pb-28 lg:pb-6">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {/* Üst: pet özeti + seviye + streak */}
        {petData && hasPet && (
          <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {petData.name} <span className="text-xs text-[var(--accent-green)]">● on Base</span>
              </p>
              <div className="mt-2 max-w-xs">
                <LevelBadge level={Number(petData.level)} totalXP={Number(petData.totalXP)} />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:w-64">
              <StreakWidget current={streak.current} longest={streak.longest} />
              <ShareButtons
                text={`I'm taking care of ${petData.name} (Lv.${petData.level}), my on-chain pet on Base! 🐾 BasePet`}
                url={address ? `${typeof window !== "undefined" ? window.location.origin : ""}/pet/${address}` : undefined}
              />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 lg:flex-row">
          {/* Merkez: 3D sahne */}
          <div className="relative h-[360px] flex-1 overflow-hidden sm:h-[460px]">
            <div className="glass-card h-full w-full overflow-hidden">
              <PetSprite animation={displayAnimation} />
            </div>
            <TxStatusOverlay status={txStatus} />
            <XPPopup amount={xp} />
          </div>

          {/* Sağ: ihtiyaç barları + quests */}
          <div className="glass-card flex w-full flex-col gap-4 p-4 lg:w-64">
            <p className="text-sm font-semibold">Needs</p>
            {NEEDS.map((n) => (
              <NeedBar key={n} need={n} value={bars[n]} />
            ))}
            <DailyQuests quests={quests} />
            <ReferralCard address={address} />
          </div>
        </div>

        {/* Durum mesajları (bağlı değil / deploy yok / pet yok) */}
        {!showActions && (
          <div className="glass-card flex flex-col items-center gap-4 p-4">
            {!isConnected ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  Connect your wallet to start
                </p>
                <ConnectButton />
              </div>
            ) : !deployed ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-sm text-[var(--accent-amber)]">
                  Wrong network. Switch your wallet to <b>Base</b> to play.
                </p>
                <button
                  type="button"
                  className="cta-btn"
                  onClick={() => switchChain({ chainId: base.id })}
                >
                  Switch to Base
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  You don&apos;t have a pet yet. Create one!
                </p>
                <div className="flex gap-2">
                  <input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Pet name"
                    className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-tertiary)] px-3 py-2 text-sm outline-none focus:border-[var(--accent-blue)]"
                  />
                  <button
                    type="button"
                    className="cta-btn"
                    onClick={handleCreate}
                    disabled={txStatus === "pending" || !petName.trim()}
                  >
                    Create Pet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Aksiyonlar: desktop'ta akış içinde, mobilde sabit alt bar */}
        {showActions && (
          <div className="glass-card hidden flex-col items-center gap-4 p-4 lg:flex">
            <PetActions onAction={handleAction} disabled={txStatus === "pending"} />
          </div>
        )}
      </div>

      {/* Mobil sabit alt aksiyon barı */}
      {showActions && (
        <div className="glass-card fixed inset-x-0 bottom-0 z-40 flex justify-center !rounded-none border-x-0 border-b-0 p-3 lg:hidden">
          <PetActions onAction={handleAction} disabled={txStatus === "pending"} />
        </div>
      )}

      {/* Oyun salonu (Play butonu açar) */}
      <GameArcade
        open={arcadeOpen}
        onClose={() => setArcadeOpen(false)}
        onPlayTx={playGameTx}
        busy={txStatus === "pending"}
        onResult={(win) => {
          if (win) recordWin();
        }}
      />
    </div>
  );
}
