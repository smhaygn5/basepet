import { createConfig } from "ponder";
import { http } from "viem";
import { petCoreEventsAbi } from "./abis/PetCoreAbi";

/**
 * Ponder yapılandırması — PetCore olaylarını Base Mainnet'ten indexler.
 * NOT: Çalıştırmadan önce PETCORE_ADDRESS, START_BLOCK ve RPC ayarlanmalı,
 * sözleşme Base Mainnet'e deploy edilmiş olmalı.
 */
export default createConfig({
  chains: {
    base: {
      id: 8453,
      rpc: http(process.env.PONDER_RPC_URL_8453 ?? "https://mainnet.base.org"),
    },
  },
  contracts: {
    PetCore: {
      chain: "base",
      abi: petCoreEventsAbi,
      address: (process.env.PETCORE_ADDRESS as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
      startBlock: Number(process.env.PETCORE_START_BLOCK ?? 0),
    },
  },
});
