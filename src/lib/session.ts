import "server-only";
import type { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  nonce?: string;
  address?: string;
  chainId?: number;
  siwe?: boolean;
}

/**
 * iron-session yapılandırması. SESSION_SECRET en az 32 karakter olmalı.
 * Üretimde mutlaka güçlü bir secret ayarla (.env.local).
 */
export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "basepet_dev_only_session_secret_change_me_32+",
  cookieName: "basepet_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
