"use client";

import { useReferral } from "@/hooks/useReferral";

/**
 * Davet (referral) kartı — davet linkini kopyalar (plan §5.4).
 * Bonus XP, davet edilen ilk aksiyonunu yaptığında backend tarafından verilir.
 */
export function ReferralCard({ address }: { address?: string }) {
  const { inviteLink, copyInvite, copied } = useReferral(address);

  if (!address) return null;

  return (
    <div className="glass-card flex flex-col gap-2 p-4">
      <span className="text-sm font-semibold">Invite a friend 🎁</span>
      <p className="text-xs text-[var(--text-secondary)]">
        Earn bonus XP for every friend you invite.
      </p>
      <button
        type="button"
        onClick={copyInvite}
        className="cta-btn text-sm"
        disabled={!inviteLink}
      >
        {copied ? "Copied ✓" : "Copy invite link"}
      </button>
    </div>
  );
}
