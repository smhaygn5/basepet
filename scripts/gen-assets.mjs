// BasePet marka görselleri üretici: SVG → PNG (icon, og, splash).
// Çalıştır: node scripts/gen-assets.mjs   (gerekli: sharp)
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

// Amber pati (vektör) — emoji rasterize sorunlarından kaçınmak için şekille çizildi.
function paw(cx, cy, s, fill = "#f59e0b") {
  return `
    <ellipse cx="${cx}" cy="${cy + s * 0.55}" rx="${s}" ry="${s * 0.82}" fill="${fill}"/>
    <circle cx="${cx - s * 0.72}" cy="${cy - s * 0.35}" r="${s * 0.34}" fill="${fill}"/>
    <circle cx="${cx - s * 0.24}" cy="${cy - s * 0.7}" r="${s * 0.36}" fill="${fill}"/>
    <circle cx="${cx + s * 0.24}" cy="${cy - s * 0.7}" r="${s * 0.36}" fill="${fill}"/>
    <circle cx="${cx + s * 0.72}" cy="${cy - s * 0.35}" r="${s * 0.34}" fill="${fill}"/>`;
}

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e1a"/>
      <stop offset="0.5" stop-color="#1e1b4b"/>
      <stop offset="1" stop-color="#0a0e1a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="#3b82f6" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <rect width="1024" height="1024" rx="220" fill="url(#glow)"/>
  ${paw(512, 470, 150)}
</svg>`;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e1a"/>
      <stop offset="0.5" stop-color="#1e1b4b"/>
      <stop offset="1" stop-color="#0a0e1a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${paw(980, 300, 130)}
  <text x="90" y="300" font-family="Arial, sans-serif" font-size="92" font-weight="700" fill="#f9fafb">BasePet</text>
  <text x="92" y="370" font-family="Arial, sans-serif" font-size="34" fill="#9ca3af">On-chain 3D pet game on Base</text>
  <text x="92" y="420" font-family="Arial, sans-serif" font-size="30" fill="#f59e0b">Feed · Play · Grow</text>
</svg>`;

await sharp(Buffer.from(iconSvg)).png().toFile("public/icon.png");
await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(Buffer.from(iconSvg)).resize(200, 200).png().toFile("public/splash.png");
await sharp(Buffer.from(ogSvg)).png().toFile("public/og.png");

console.log("Görseller üretildi: public/icon.png, icon-512.png, splash.png, og.png");
