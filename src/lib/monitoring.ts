/**
 * Hafif hata izleme soyutlaması (plan §4.2).
 * DSN yoksa console'a düşer (graceful). Canlı Sentry için:
 *   1) `npm i @sentry/nextjs`
 *   2) NEXT_PUBLIC_SENTRY_DSN ayarla
 *   3) Aşağıdaki captureError'da @sentry/nextjs `captureException` çağır (yorum satırı).
 *
 * Bu soyutlama, uygulama kodunu Sentry'ye sıkı bağlamadan tutar.
 */
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (DSN) {
    // Canlıda: import("@sentry/nextjs").then(S => S.captureException(error, { extra: context }))
    // (paket kurulduğunda etkinleşir)
  }
  if (process.env.NODE_ENV !== "production") {
    console.error("[monitoring]", error, context ?? "");
  }
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[monitoring]", message, context ?? "");
  }
}
