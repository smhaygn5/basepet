import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/**
 * Paymaster proxy (plan §8.2 / §7.3).
 * CDP Paymaster API anahtarı YALNIZCA server'da kalır, ASLA client'a sızmaz.
 * Katmanlar:
 *  1. SIWE oturum doğrulaması
 *  2. Rate limit (IP + wallet)
 *  3. Yalnızca izinli metotlar (performAction, createPet)
 *  4. Günlük sponsorlu işlem limiti (wallet başına 20)
 *  5. CDP Paymaster'a forward
 *
 * NOT: PAYMASTER_API_KEY yoksa 503 (canlı kurulum kullanıcı anahtar verince).
 */
const ALLOWED_METHODS = ["performAction", "createPet"];
const DAILY_LIMIT = 20;

export async function POST(req: Request) {
  // 0. Acil kill-switch: PAYMASTER_ENABLED=false → sponsorluk tamamen kapalı
  if (process.env.PAYMASTER_ENABLED === "false") {
    return NextResponse.json({ error: "Paymaster temporarily disabled" }, { status: 503 });
  }

  // 1. Oturum
  const session = await getSession();
  if (!session.siwe || !session.address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const wallet = session.address.toLowerCase();

  // 2. Rate limit (IP/dk 30, wallet/dk 10)
  const ip = getClientIp(req);
  const ipRl = await rateLimit(`pm:ip:${ip}`, 30, 60);
  const wRl = await rateLimit(`pm:wallet:${wallet}`, 10, 60);
  if (!ipRl.success || !wRl.success) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  // 3. İzinli metot
  let body: { method?: string; userOp?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.method || !ALLOWED_METHODS.includes(body.method)) {
    return NextResponse.json({ error: "Method not sponsored" }, { status: 403 });
  }

  // 4. Günlük limit (gün sonuna kadar pencere)
  const day = new Date().toISOString().slice(0, 10);
  const daily = await rateLimit(`pm:daily:${wallet}:${day}`, DAILY_LIMIT, 86400);
  if (!daily.success) {
    return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
  }

  // 5. CDP Paymaster'a forward
  const paymasterUrl = process.env.PAYMASTER_API_KEY
    ? process.env.CDP_PAYMASTER_URL
    : undefined;
  if (!process.env.PAYMASTER_API_KEY || !paymasterUrl) {
    return NextResponse.json(
      { error: "Paymaster not configured (CDP key required)" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(paymasterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PAYMASTER_API_KEY}`,
      },
      body: JSON.stringify(body.userOp),
    });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Paymaster error" }, { status: 502 });
  }
}
