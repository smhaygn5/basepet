"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider, useAccountEffect } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { wagmiConfig } from "@/lib/chains";

import "@rainbow-me/rainbowkit/styles.css";
import "@coinbase/onchainkit/styles.css";

/**
 * Disconnect olunca cüzdan iznini geri alır (EIP-2255 wallet_revokePermissions).
 * Böylece kullanıcı bağlantıyı kestikten sonra tekrar bağlanırken cüzdan
 * yeniden onay sorar (sessiz reconnect olmaz). MetaMask/injected destekler;
 * desteklemeyen cüzdanlarda sessizce yok sayılır.
 */
function DisconnectWatcher() {
  useAccountEffect({
    onDisconnect() {
      const eth = (
        window as unknown as {
          ethereum?: {
            request?: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
          };
        }
      ).ethereum;
      eth?.request?.({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      }).catch(() => {});
    },
  });
  return null;
}

/**
 * Tüm web3 sağlayıcıları: WagmiProvider → QueryClient → OnchainKit → RainbowKit.
 * `reconnectOnMount={false}`: sayfa açılışında otomatik/sessiz bağlanma YOK —
 * kullanıcı her oturumda açıkça Connect'e basıp cüzdan onayı verir. Sekmeler
 * arası geçişte bağlantı bellekte korunur (provider kök layout'ta mount kalır).
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
        >
          <RainbowKitProvider
            locale="en-US"
            theme={darkTheme({
              accentColor: "#3b82f6",
              accentColorForeground: "white",
              borderRadius: "medium",
              overlayBlur: "small",
            })}
          >
            <DisconnectWatcher />
            {children}
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
