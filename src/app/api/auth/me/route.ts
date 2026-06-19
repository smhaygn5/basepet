import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Mevcut oturum bilgisini döner. */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    address: session.address ?? null,
    siwe: Boolean(session.siwe),
  });
}

/** Oturumu kapatır (logout). */
export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
