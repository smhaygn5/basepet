# BasePet — Deployment Rehberi (Base Mainnet)

> Proje yalnızca **Base Mainnet** içindir; Base Sepolia kullanılmaz.

## A) Akıllı Sözleşme (Base Mainnet)

### Gerekli env (contracts)
```
DEPLOYER_KEY=         # funded deployer (gerçek ETH)
MULTISIG_ADDRESS=     # Gnosis Safe (timelock proposer/executor)
GUARDIAN_ADDRESS=     # acil pause yetkisi (yoksa MULTISIG)
BASESCAN_API_KEY=     # --verify için
```

### Base Mainnet deploy (audit + iç kontrol sonrası)
```bash
cd contracts
forge script script/DeployProduction.s.sol:DeployProduction \
  --rpc-url https://mainnet.base.org --broadcast \
  --private-key $DEPLOYER_KEY --verify --etherscan-api-key $BASESCAN_API_KEY
```
Çıktıdaki **proxy** adreslerini (PetCore + AccessoryShop) `src/lib/contracts.ts`
`base` girişlerine yaz. Yetki: owner = Timelock (48s), pauser = guardian.

> Mainnet öncesi zorunlu: `contracts/SECURITY.md` checklist + harici audit + Slither.
> (Yerel duman testi için anvil/foundry kullanılabilir — testnet adımı yok.)

## B) Frontend (Vercel)

1. Repo'yu Vercel'e bağla (framework: Next.js, `vercel.json` mevcut).
2. Environment Variables (Production) — `.env.example`'daki tüm anahtarlar:
   - Public: `NEXT_PUBLIC_*` (WalletConnect, OnchainKit, RPC, Supabase, Sentry DSN)
   - Server-only: `SESSION_SECRET`, `PAYMASTER_API_KEY`, `CDP_PAYMASTER_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_*`, `PAYMASTER_ENABLED`
3. Deploy. CSP/güvenlik header'ları `next.config.ts`'te otomatik.

## C) Indexer (Ponder) & Supabase
- Supabase: `supabase/schema.sql` çalıştır (RLS dahil), `supabase functions deploy streak`.
- Ponder: `cd indexer && npm install`, `.env.local` doldur (canlı PETCORE_ADDRESS), `npm run start`.

## D) İzleme
- Sentry: `npm i @sentry/nextjs` + DSN (bkz. `src/lib/monitoring.ts`).
- Tenderly: proxy + impl adreslerini ekle, alert kur.

## Acil durum
Bkz. `docs/RUNBOOK.md` (pause, paymaster kill-switch, timelock upgrade).
