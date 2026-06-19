"use client";

/**
 * Farcaster (Warpcast) paylaşım butonu — compose intent açar (plan §5.4).
 */
export function ShareButton({ text, url }: { text: string; url?: string }) {
  function share() {
    const u = new URL("https://warpcast.com/~/compose");
    u.searchParams.set("text", text);
    if (url) u.searchParams.append("embeds[]", url);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-tertiary)] px-3 py-2 text-xs transition-colors hover:border-[var(--accent-purple)]"
    >
      🟣 Farcaster&apos;da paylaş
    </button>
  );
}
