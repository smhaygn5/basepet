"use client";

/**
 * Hafif sentetik ses efektleri (Web Audio) — asset gerektirmez.
 * Kullanıcı etkileşimiyle (buton) tetiklenir. Mute durumu localStorage'da.
 * Desteklenmeyen/engelli ortamlarda (mobil webview) sessizce yok sayılır.
 */
type Sfx = "spin" | "win" | "lose";

const MUTE_KEY = "basepet_muted";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(m: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {}
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.06) {
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(c.destination);
    const t0 = c.currentTime + start;
    osc.start(t0);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.stop(t0 + dur);
  } catch {}
}

export function playSfx(kind: Sfx) {
  if (isMuted()) return;
  if (kind === "spin") {
    tone(420, 0, 0.08, "square", 0.04);
    tone(520, 0.06, 0.08, "square", 0.04);
  } else if (kind === "win") {
    // yükselen mutlu akor
    tone(523, 0, 0.14, "triangle");
    tone(659, 0.1, 0.14, "triangle");
    tone(784, 0.2, 0.22, "triangle");
  } else {
    // alçalan üzgün ton
    tone(300, 0, 0.18, "sine", 0.05);
    tone(200, 0.14, 0.24, "sine", 0.05);
  }
}
