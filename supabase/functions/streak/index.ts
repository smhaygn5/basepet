// BasePet — Streak hesaplama Edge Function (Supabase / Deno)
// Deploy (canlı, ertelendi): supabase functions deploy streak
//
// Bir bakım aksiyonu sonrası çağrılır; günlük seriyi (streak) günceller.
// Aynı gün tekrar → değişmez; ardışık gün → +1; boşluk → 1'e sıfırlanır.

// @ts-nocheck — Deno runtime'da çalışır (Node tип kontrolünden hariç).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const { wallet_address } = await req.json();
    if (!wallet_address) {
      return new Response(JSON.stringify({ error: "wallet_address gerekli" }), {
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);

    const { data: existing } = await supabase
      .from("streaks")
      .select("*")
      .eq("wallet_address", wallet_address)
      .maybeSingle();

    let current = 1;
    let longest = 1;

    if (existing) {
      const last = existing.last_action_day as string | null;
      if (last === today) {
        current = existing.current_streak; // aynı gün, değişme
      } else if (last && isYesterday(last, today)) {
        current = existing.current_streak + 1; // ardışık gün
      } else {
        current = 1; // boşluk → sıfırla
      }
      longest = Math.max(existing.longest_streak ?? 0, current);
    }

    await supabase.from("streaks").upsert({
      wallet_address,
      current_streak: current,
      longest_streak: longest,
      last_action_day: today,
      updated_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ current_streak: current, longest_streak: longest }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});

function isYesterday(prev: string, today: string): boolean {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10) === prev;
}
