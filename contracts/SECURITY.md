# PetCore — İç Güvenlik Denetimi (Faz 4)

> Kapsam: `src/PetCore.sol` (UUPS upgradeable). Bu **iç** denetimdir; mainnet öncesi
> **harici profesyonel audit** ($5K–15K) ayrıca yapılmalıdır.

## Özet
- Test: **26/26 PASS**, fuzz **10.000 run** (`foundry.toml [fuzz] runs=10000`).
- Statik analiz (Slither): ⏳ ATLANDI (ortamda Python yok). Mainnet öncesi `pip install slither-analyzer && slither .` çalıştırılmalı.

## Kontrol Listesi (plan §7.1)

| # | Kontrol | Durum | Not |
|---|---------|:-----:|-----|
| 1 | **CEI deseni** | ✅ | `performAction`: Checks (pet/config/cooldown) → Effects (timestamp/XP/level) → Interaction (event). |
| 2 | **ReentrancyGuard** | ✅ | `performAction` `nonReentrant` (ReentrancyGuardTransient, EIP-1153). |
| 3 | **Overflow** | ✅ | Solidity 0.8.35 yerleşik. |
| 4 | **Access Control** | ✅ | `onlyOwner` (config/upgrade/setPauser) + `onlyPauser` (pause). Production'da owner = **Timelock**, pauser = **guardian/multisig**. |
| 5 | **Pausable** | ✅ | `whenNotPaused` createPet/performAction. Acil pause guardian'da (timelock gecikmesiz). |
| 6 | **Input validation** | ✅ | Boş isim (`EmptyName`), pet yokluğu (`PetNotFound`), aktif olmayan aksiyon (`ActionNotActive`), sıfır adres (`ZeroAddress`). |
| 7 | **UUPS init kilidi** | ✅ | Constructor'da `_disableInitializers()`; `initialize` `initializer` modifier. |
| 8 | **Upgrade yetkisi** | ✅ | `_authorizeUpgrade` `onlyOwner` (= Timelock, 48s gecikme). |
| 9 | **Cooldown** | ✅ | Aksiyon başına `cooldownSeconds`; ilk aksiyon cooldown'suz (lastTimestamp==0). |
| 10 | **Storage gap** | ✅ | `uint256[44] __gap` (pauser eklenince güncellendi). |
| 11 | **Reinitialize koruması** | ✅ | `test_RevertWhen_InitializeTwice`. |

## Yetki Mimarisi (production)
```
Gnosis Safe (multisig) ──proposer/executor──> TimelockController (48s) ──owner──> PetCore proxy
Guardian/multisig ──────────────pauser──────────────────────────────────────────> PetCore (acil pause)
```
- Upgrade & config değişiklikleri 48 saat timelock'tan geçer (şeffaflık + geri alma penceresi).
- Acil pause anında (guardian) — timelock beklemez.

## Mainnet Öncesi Kalan (zorunlu)
- [ ] Slither + Mythril statik analiz
- [ ] Harici profesyonel audit
- [ ] Anvil/yerel fork üzerinde kapsamlı entegrasyon testi (testnet adımı yok)
- [ ] BaseScan kaynak doğrulama (`--verify`)
- [ ] Tenderly işlem simülasyonu / monitoring
