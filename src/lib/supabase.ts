import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client'ları.
 * - browser/anon: RLS uygulanır (kullanıcı sadece kendi verisi).
 * - service role: yalnızca server tarafı (RLS bypass) — ASLA client'a sızdırma.
 *
 * NOT: Canlı kullanım için NEXT_PUBLIC_SUPABASE_URL / anon / service role
 * anahtarları .env.local'a girilmeli. Anahtar yoksa null döner (graceful).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

/** Yalnızca server tarafında çağrılmalı. */
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
