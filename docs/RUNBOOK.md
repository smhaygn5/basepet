# BasePet — Acil Durum Runbook (Faz 4)

## 1. Acil Sözleşme Durdurma (Emergency Pause)

**Ne zaman:** Anormal aktivite, exploit şüphesi, indexer/paymaster anomalisi.

**Kim:** `pauser` adresi (guardian / Gnosis Safe). Timelock GEREKMEZ — anında.

**Nasıl:**
```bash
cast send <PROXY> "pause()" --rpc-url <BASE_RPC> --private-key <GUARDIAN_KEY>
# veya Gnosis Safe UI'dan pause() işlemi
```
Etki: `createPet` ve `performAction` durur (`whenNotPaused`). Okuma fonksiyonları çalışır.

**Geri alma:**
```bash
cast send <PROXY> "unpause()" --rpc-url <BASE_RPC> --private-key <GUARDIAN_KEY>
```

## 2. Paymaster Acil Kapatma (Gas sponsorluğu sömürüsü)

`PAYMASTER_ENABLED=false` env ayarla → `/api/paymaster` 503 döner (kod kill-switch).
Vercel'de env güncelle + redeploy (veya edge config). Ayrıca CDP panelinden sponsor politikası kapatılabilir.

## 3. Upgrade (Timelock üzerinden, 48 saat)

1. Yeni impl deploy et.
2. Gnosis Safe → TimelockController `schedule(...)` ile `upgradeToAndCall` öner (48s gecikme).
3. 48 saat sonra `execute(...)`.
> Acil patch gerekiyorsa önce **pause**, sonra normal timelock upgrade akışı.

## 4. Eskalasyon
- Sentry alarmı → Discord/Telegram bildirimi → guardian değerlendirir → gerekirse pause.
- Tenderly monitoring → anormal işlem deseni → inceleme.

## İlgili
- Yetki mimarisi: `contracts/SECURITY.md`
- Production deploy: `contracts/script/DeployProduction.s.sol`, `docs/DEPLOYMENT.md`
