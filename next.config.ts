import type { NextConfig } from "next";

/**
 * Güvenlik header'ları (plan §3.5 / §7.3).
 * - CSP: web3 cüzdan akışları (WalletConnect wss, RPC https) çalışsın diye
 *   connect-src geniş; script/style web3 kütüphaneleri için inline/eval'e izin.
 * - frame-ancestors: Farcaster Mini App (Warpcast iframe) için izinli — bu yüzden
 *   X-Frame-Options: DENY KULLANILMAZ (mini app'i kırardı).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https:",
  "frame-ancestors 'self' https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
