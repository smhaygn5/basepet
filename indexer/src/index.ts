import { ponder } from "ponder:registry";
import { pet, action } from "ponder:schema";
import { createClient } from "@supabase/supabase-js";

/**
 * PetCore olay handler'ları → Ponder DB + Supabase leaderboard senkronu.
 * NOT: Supabase env yoksa yalnızca Ponder DB'ye yazılır (graceful).
 */
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

ponder.on("PetCore:PetCreated", async ({ event, context }) => {
  await context.db
    .insert(pet)
    .values({
      owner: event.args.owner,
      name: event.args.name,
      totalXP: 0n,
      level: 1n,
      createdAt: event.args.timestamp,
    })
    .onConflictDoNothing();
});

ponder.on("PetCore:ActionPerformed", async ({ event, context }) => {
  await context.db.insert(action).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    owner: event.args.owner,
    actionType: event.args.actionType,
    xpGained: event.args.xpGained,
    timestamp: event.args.timestamp,
  });

  // Pet toplam XP'yi artır
  await context.db
    .update(pet, { owner: event.args.owner })
    .set((row) => ({ totalXP: row.totalXP + event.args.xpGained }));
});

ponder.on("PetCore:LevelUp", async ({ event, context }) => {
  await context.db
    .update(pet, { owner: event.args.owner })
    .set({ level: event.args.newLevel, totalXP: event.args.totalXP });

  // Leaderboard cache (Supabase)
  if (supabase) {
    await supabase.from("leaderboard").upsert({
      wallet_address: event.args.owner,
      total_xp: Number(event.args.totalXP),
      level: Number(event.args.newLevel),
      updated_at: new Date().toISOString(),
    });
  }
});
