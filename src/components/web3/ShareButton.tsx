"use client";

/**
 * Social share buttons — Farcaster (Warpcast) + X (Twitter).
 */
export function ShareButtons({ text, url }: { text: string; url?: string }) {
  function shareFarcaster() {
    const u = new URL("https://warpcast.com/~/compose");
    u.searchParams.set("text", text);
    if (url) u.searchParams.append("embeds[]", url);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  }

  function shareX() {
    const u = new URL("https://twitter.com/intent/tweet");
    u.searchParams.set("text", text);
    if (url) u.searchParams.set("url", url);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  }

  const cls =
    "flex-1 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-tertiary)] px-3 py-2 text-xs transition-colors";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={shareFarcaster}
        className={`${cls} hover:border-[var(--accent-purple)]`}
      >
        🟣 Share on Farcaster
      </button>
      <button
        type="button"
        onClick={shareX}
        className={`${cls} hover:border-[var(--text-primary)]`}
      >
        𝕏 Share on X
      </button>
    </div>
  );
}
