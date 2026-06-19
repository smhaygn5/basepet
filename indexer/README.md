# BasePet Indexer (Ponder)

PetCore olaylarını (PetCreated, ActionPerformed, LevelUp) **Base Mainnet'ten** indexler ve
opsiyonel olarak Supabase `leaderboard` tablosuna yazar.

## Kurulum (canlı — ertelendi)

Bu indexer çalıştırmak için **canlı deploy edilmiş bir PetCore** adresi gerekir.

```bash
cd indexer
npm install
cp .env.example .env.local   # PETCORE_ADDRESS, PETCORE_START_BLOCK, RPC doldur
npm run dev
```

## Dosyalar
- `ponder.config.ts` — ağ + sözleşme (adres/ABI/startBlock)
- `ponder.schema.ts` — `pet`, `action` tabloları
- `src/index.ts` — olay handler'ları (+ Supabase leaderboard upsert)
- `abis/PetCoreAbi.ts` — indexlenen event ABI'leri

> NOT: Ponder API sürümle değişebilir; `npm install` sonrası `ponder.config.ts`/`src`
> güncel sürüme göre küçük uyarlama gerektirebilir.
