import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { getSession } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/**
 * SIWE imzasını doğrular. EOA için ECDSA; Coinbase Smart Wallet (EIP-1271) ve
 * deploy edilmemiş cüzdanlar (ERC-6492) siwe/viem altyapısı ile desteklenir.
 * Domain ve nonce eşleşmesi kontrol edilir (replay/phishing önlemi).
 */
export async function POST(req: Request) {
  try {
    // Rate limit: IP başına dakikada 10 doğrulama denemesi
    const ip = getClientIp(req);
    const rl = await rateLimit(`verify:${ip}`, 10, 60);
    if (!rl.success) {
      return NextResponse.json({ error: "Çok fazla deneme" }, { status: 429 });
    }

    const { message, signature } = await req.json();
    if (!message || !signature) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    const session = await getSession();
    const siwe = new SiweMessage(message);
    const result = await siwe.verify({
      signature,
      nonce: session.nonce,
      domain: new URL(req.url).host,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Doğrulama başarısız" }, { status: 401 });
    }

    session.siwe = true;
    session.address = result.data.address;
    session.chainId = result.data.chainId;
    session.nonce = undefined;
    await session.save();

    return NextResponse.json({ ok: true, address: result.data.address });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
}
