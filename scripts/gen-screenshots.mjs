// BasePet App Store ekran görüntüleri: geniş ekran kırpıntılarını 1284×2778
// dikey (telefon) formatına, marka arka planı + başlık + çerçeve ile yerleştirir.
// Çalıştır: node scripts/gen-screenshots.mjs   (gerekli: sharp)
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "C:/Users/SEMİH AYGÜN/OneDrive/Pictures/Screenshots/";
const OUT = "public/store";
mkdirSync(OUT, { recursive: true });

const W = 1284;
const H = 2778;

// XML/SVG güvenli metin
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Amber pati (vektör)
function paw(cx, cy, s, fill = "#f59e0b") {
  return `
    <ellipse cx="${cx}" cy="${cy + s * 0.55}" rx="${s}" ry="${s * 0.82}" fill="${fill}"/>
    <circle cx="${cx - s * 0.72}" cy="${cy - s * 0.35}" r="${s * 0.34}" fill="${fill}"/>
    <circle cx="${cx - s * 0.24}" cy="${cy - s * 0.7}" r="${s * 0.36}" fill="${fill}"/>
    <circle cx="${cx + s * 0.24}" cy="${cy - s * 0.7}" r="${s * 0.36}" fill="${fill}"/>
    <circle cx="${cx + s * 0.72}" cy="${cy - s * 0.35}" r="${s * 0.34}" fill="${fill}"/>`;
}

// Ekranlar: kaynak dosya + başlık + alt başlık
// crop: kaynaktaki en önemli bölge (left/top/width/height); böylece kart daha
// büyük ve okunur olur (boş alan / az önemli kenarlar atılır).
const shots = [
  {
    file: "Ekran görüntüsü 2026-06-21 160338.png", // Home / hero (1878x544)
    crop: { left: 300, top: 25, width: 1300, height: 505 },
    title: "Care for your on-chain pet",
    subtitle: "Every action is a memory on Base",
    out: "screenshot-1.png",
  },
  {
    file: "Ekran görüntüsü 2026-06-21 160344.png", // Dashboard (1903x627)
    crop: { left: 600, top: 0, width: 1303, height: 627 },
    title: "Feed, play & grow",
    subtitle: "Daily quests, streaks & XP",
    out: "screenshot-2.png",
  },
  {
    file: "Ekran görüntüsü 2026-06-21 160349.png", // Leaderboard (1919x429)
    crop: { left: 560, top: 20, width: 960, height: 240 },
    title: "Climb the leaderboard",
    subtitle: "Compete with Basenames",
    out: "screenshot-3.png",
  },
];

// Kart genişliği ve yerleşim
const CARD_W = 1140;
const CARD_X = Math.round((W - CARD_W) / 2);
const RADIUS = 32;

async function build(shot) {
  const input = SRC + shot.file;
  // Önce önemli bölgeyi kırp
  const base = sharp(input);
  const cropped = shot.crop
    ? base.extract(shot.crop)
    : base;
  const srcW = shot.crop ? shot.crop.width : (await sharp(input).metadata()).width;
  const srcH = shot.crop ? shot.crop.height : (await sharp(input).metadata()).height;
  const cardH = Math.round((CARD_W * srcH) / srcW);

  // Ekran görüntüsünü yuvarlatılmış köşeyle hazırla
  const mask = Buffer.from(
    `<svg width="${CARD_W}" height="${cardH}"><rect width="${CARD_W}" height="${cardH}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`
  );
  const cardImg = await cropped
    .resize(CARD_W, cardH, { fit: "fill" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  // Kartı dikeyde ortaya yakın yerleştir (başlığa yer bırak)
  const cardY = Math.round((H - cardH) / 2) + 120;

  // Arka plan + başlık + çerçeve overlay
  const bg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0a0e1a"/>
        <stop offset="0.5" stop-color="#1e1b4b"/>
        <stop offset="1" stop-color="#0a0e1a"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.32" r="0.7">
        <stop offset="0" stop-color="#3b82f6" stop-opacity="0.28"/>
        <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>

    <!-- Logo -->
    ${paw(W / 2 - 150, 340, 44)}
    <text x="${W / 2 - 70}" y="365" font-family="Arial, sans-serif" font-size="76"
          font-weight="700" fill="#f9fafb">BasePet</text>

    <!-- Başlık -->
    <text x="${W / 2}" y="620" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="86" font-weight="700" fill="#f9fafb">${esc(shot.title)}</text>
    <text x="${W / 2}" y="710" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="44" fill="#f59e0b">${esc(shot.subtitle)}</text>

    <!-- Kart çerçevesi (gölge etkisi) -->
    <rect x="${CARD_X - 14}" y="${cardY - 14}" width="${CARD_W + 28}" height="${cardH + 28}"
          rx="${RADIUS + 10}" ry="${RADIUS + 10}" fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

    <!-- Alt etiket -->
    <text x="${W / 2}" y="${H - 180}" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="40" fill="#9ca3af">Live on Base • basepet-one.vercel.app</text>
  </svg>`);

  await sharp(bg)
    .composite([{ input: cardImg, left: CARD_X, top: cardY }])
    .png()
    .toFile(`${OUT}/${shot.out}`);

  console.log(`✓ ${OUT}/${shot.out}  (${W}x${H})`);
}

for (const s of shots) await build(s);
console.log("Bitti.");
