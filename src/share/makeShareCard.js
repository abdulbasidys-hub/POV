import { CONFIG } from "../config.js";
import { SHARE } from "../pov/copy.js";

const W = 1200;
const H = 630;
const SPLIT = Math.round(W * 0.6);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fontsReady() {
  try {
    await Promise.all([
      document.fonts.load('300 48px "Cormorant Garamond"'),
      document.fonts.load('600 48px "Cormorant Garamond"'),
      document.fonts.load('500 16px "Inter"'),
    ]);
  } catch {
    /* system fallback fonts are fine */
  }
}

function drawCover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function addGrain(ctx, amount = 10) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

async function heroSnapshot(canvas) {
  if (canvas) {
    try {
      return await loadImage(canvas.toDataURL("image/png"));
    } catch {
      /* fall through */
    }
  }
  try {
    return await loadImage("/fallback-hero.png");
  } catch {
    return null;
  }
}

/** Builds the 1200×630 share card for this visitor's view. Resolves to a PNG Blob. */
export async function makeShareCard({ view, canvas }) {
  const { palette } = view;
  const [, snap] = await Promise.all([fontsReady(), heroSnapshot(canvas)]);

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  // Left 60%: the hero as this visitor saw it.
  if (snap) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, SPLIT, H);
    ctx.clip();
    drawCover(ctx, snap, 0, 0, SPLIT, H);
    if (!canvas) {
      // fallback still: tint it with the key light, as the page does
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = palette.light;
      ctx.fillRect(0, 0, SPLIT, H);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
  }
  // Soft hand-off into the text panel
  const fade = ctx.createLinearGradient(SPLIT - 220, 0, SPLIT + 10, 0);
  fade.addColorStop(0, `${palette.bg}00`);
  fade.addColorStop(1, palette.bg);
  ctx.fillStyle = fade;
  ctx.fillRect(SPLIT - 220, 0, 232, H);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(SPLIT + 10, 0, W - SPLIT, H);

  // Band vignette
  const v = ctx.createRadialGradient(W * 0.42, H * 0.5, H * 0.3, W * 0.5, H * 0.5, W * 0.72);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(SPLIT * 0.5, H * 0.45, 0, SPLIT * 0.5, H * 0.45, H * 0.8);
  glow.addColorStop(0, `${palette.light}14`);
  glow.addColorStop(1, `${palette.light}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Right 40%: the sentence, the line, the ticker.
  const x = SPLIT + 24;
  const maxW = W - x - 56;
  const top = 72;
  const bottomReserve = 150;
  let size = 40;
  let lines;
  do {
    ctx.font = `300 ${size}px "Cormorant Garamond", Georgia, serif`;
    lines = wrap(ctx, view.copy.reveal, maxW);
    size -= 1;
  } while (lines.length * size * 1.18 > H - top - bottomReserve && size > 18);
  size += 1;
  ctx.fillStyle = palette.text;
  ctx.textBaseline = "alphabetic";
  lines.forEach((l, i) => ctx.fillText(l, x, top + size + i * size * 1.18));

  ctx.font = '500 15px "Inter", system-ui, sans-serif';
  ctx.fillStyle = palette.light;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.fillText(SHARE.cardTagline, x, H - 92);

  ctx.font = '600 34px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = palette.text;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  const tw = ctx.measureText(SHARE.cardTicker).width;
  ctx.fillText(SHARE.cardTicker, W - 56 - tw, H - 48);

  addGrain(ctx, 12);

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"));
}

function canShareFiles() {
  try {
    const probe = new File([new Blob([""], { type: "image/png" })], SHARE.filename, { type: "image/png" });
    return Boolean(navigator.canShare && navigator.share && navigator.canShare({ files: [probe] }));
  } catch {
    return false;
  }
}

function download(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = SHARE.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Full share flow. Returns true when the card was shared or saved.
 * Must be called straight from a click so the popup and share sheet are allowed.
 */
export async function shareMyView({ view, canvas }) {
  const text = SHARE.text(CONFIG.SITE_URL, view.reading);
  const mobile = view.device !== "desktop";
  const useSheet = mobile && canShareFiles();

  // Open the tab synchronously, while we still have the click.
  let tab = null;
  if (!useSheet) {
    try {
      tab = window.open("", "_blank");
      if (tab) tab.opener = null;
    } catch {
      tab = null;
    }
  }

  let blob;
  try {
    blob = await makeShareCard({ view, canvas });
  } catch {
    if (tab) tab.close();
    return false;
  }

  if (useSheet) {
    const file = new File([blob], SHARE.filename, { type: "image/png" });
    try {
      await navigator.share({ files: [file], text });
      return true;
    } catch (e) {
      if (e && e.name === "AbortError") return false;
      // share sheet failed for another reason: fall back to download
    }
  }

  download(blob);
  const intent = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  if (tab) tab.location.href = intent;
  else window.open(intent, "_blank", "noopener,noreferrer");
  return true;
}
