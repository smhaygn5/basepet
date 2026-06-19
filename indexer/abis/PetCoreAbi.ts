// PetCore — indexlenecek olaylar (event ABI'leri).
// Tam ABI için: basepet/src/lib/petCoreAbi.ts
export const petCoreEventsAbi = [
  {
    type: "event",
    name: "PetCreated",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ActionPerformed",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "actionType", type: "uint8", indexed: false },
      { name: "xpGained", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LevelUp",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "newLevel", type: "uint256", indexed: false },
      { name: "totalXP", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;
