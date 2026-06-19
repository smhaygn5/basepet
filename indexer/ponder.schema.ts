import { onchainTable } from "ponder";

/** Pet oluşturma + güncel XP/level (event'lerden türetilir). */
export const pet = onchainTable("pet", (t) => ({
  owner: t.hex().primaryKey(),
  name: t.text().notNull(),
  totalXP: t.bigint().notNull().default(0n),
  level: t.bigint().notNull().default(1n),
  createdAt: t.bigint().notNull(),
}));

/** Her bakım aksiyonu kaydı. */
export const action = onchainTable("action", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  owner: t.hex().notNull(),
  actionType: t.integer().notNull(),
  xpGained: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
}));
