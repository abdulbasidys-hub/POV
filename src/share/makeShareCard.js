import { CONFIG } from "../config.js";
import { READING_WORD, SHARE } from "../pov/copy.js";

const W = 1200;
const H = 630;
const BANGERS_URL = "/fonts/bangers-latin.woff2";

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
      document.fonts.load('400 48px "Bangers"'),
      document.fonts.load('900 48px "Inter"', "σ"),
      document.fonts.load('700 20px "Inter"'),
    ]);
  } catch {
    /* system fallback fonts are fine */
  }
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

let bangersData = null;
async function bangersDataURL() {
  if (bangersData) return bangersData;
  try {
    const res = await fetch(BANGERS_URL);
    bangersData = await blobToDataURL(await res.blob());
  } catch {
    bangersData = "";
  }
  return bangersData;
}

// The visitor's own scene, as an image. An SVG drawn into a canvas can't see the
// page's fonts, so the comic font is embedded into a copy of it.
async function sceneImage(svg) {
  if (!svg) return null;
  const clone = svg.cloneNode(true);
  const [, , vw, vh] = (svg.getAttribute("viewBox") || "0 0 600 684").split(/\s+/).map(Number);
  clone.setAttribute("width", String(vw));
  clone.setAttribute("height", String(vh));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const font = await bangersDataURL();
  if (font) {
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `@font-face{font-family:"Bangers";src:url(${font}) format("woff2");}`;
    clone.insertBefore(style, clone.firstChild);
  }
  const markup = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await loadImage(url);
    return { img, vw, vh };
  } catch {
    return null;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
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

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A sticker-style box: hard offset shadow, thick outline.
function sticker(ctx, x, y, w, h, r, fill, line, shadow, offset = 8) {
  ctx.fillStyle = shadow;
  roundRect(ctx, x + offset, y + offset, w, h, r);
  ctx.fill();
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = line;
  ctx.stroke();
}

/** Builds the 1200×630 share card for this visitor's view. Resolves to a PNG Blob. */
export async function makeShareCard({ view, svg }) {
  const p = view.palette;
  const [, scene] = await Promise.all([fontsReady(), sceneImage(svg)]);
  const css = getComputedStyle(document.documentElement);
  const line = css.getPropertyValue("--line").trim() || "#000";
  const shadow = css.getPropertyValue("--shadow").trim() || "#000";
  const onAccent = css.getPropertyValue("--on-accent").trim() || "#0a0a0a";

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");

  // Background with halftone dots
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = p.text;
  ctx.globalAlpha = 0.07;
  for (let y = 9; y < H; y += 18) for (let x = 9; x < W; x += 18) ctx.fillRect(x, y, 2.4, 2.4);
  ctx.globalAlpha = 1;

  // Left: their scene, framed like the page
  const sh = 548;
  const sw = scene ? Math.round((sh * scene.vw) / scene.vh) : 480;
  const sx = 44;
  const sy = 34;
  sticker(ctx, sx, sy, sw, sh, 18, "#111", line, shadow, 10);
  if (scene) {
    ctx.save();
    roundRect(ctx, sx, sy, sw, sh, 18);
    ctx.clip();
    ctx.drawImage(scene.img, sx, sy, sw, sh);
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = line;
    roundRect(ctx, sx, sy, sw, sh, 18);
    ctx.stroke();
  }

  // Right: MY POV / I SEE A … / meaning / ask / ticker
  const x = sx + sw + 56;
  const maxW = W - x - 44;
  ctx.textBaseline = "alphabetic";

  ctx.save();
  ctx.translate(x, 70);
  ctx.rotate(-0.05);
  ctx.font = '400 30px "Bangers", Impact, sans-serif';
  const lw = ctx.measureText(SHARE.label).width + 34;
  sticker(ctx, 0, 0, lw, 46, 10, p.accent2, line, shadow, 4);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(SHARE.label, 17, 35);
  ctx.restore();

  const word = READING_WORD[view.reading];
  const greek = view.reading === "sigma";
  let size = 120;
  const fit = () => {
    ctx.font = `400 ${size}px "Bangers", Impact, sans-serif`;
    const lead = ctx.measureText("I SEE A ").width;
    ctx.font = greek ? `900 ${size * 0.86}px "Inter", sans-serif` : `400 ${size}px "Bangers", Impact, sans-serif`;
    return lead + ctx.measureText(`${word}.`).width;
  };
  while (fit() > maxW && size > 48) size -= 4;
  const ty = 150 + size;
  ctx.font = `400 ${size}px "Bangers", Impact, sans-serif`;
  ctx.fillStyle = p.accent;
  ctx.fillText("I SEE A ", x + 5, ty + 5);
  ctx.fillStyle = p.text;
  ctx.fillText("I SEE A ", x, ty);
  const lead = ctx.measureText("I SEE A ").width;
  ctx.font = greek ? `900 ${size * 0.86}px "Inter", sans-serif` : `400 ${size}px "Bangers", Impact, sans-serif`;
  ctx.fillStyle = line;
  ctx.fillText(`${word}.`, x + lead + 5, ty + 5);
  ctx.fillStyle = p.accent2;
  ctx.fillText(`${word}.`, x + lead, ty);

  ctx.font = '700 26px "Inter", system-ui, sans-serif';
  ctx.fillStyle = p.text;
  wrap(ctx, view.copy.meaning, maxW).forEach((l, i) => ctx.fillText(l, x, ty + 54 + i * 34));

  ctx.font = '400 32px "Bangers", Impact, sans-serif';
  const aw = ctx.measureText(SHARE.ask).width + 40;
  sticker(ctx, x, H - 124, aw, 54, 27, p.accent, line, shadow, 5);
  ctx.fillStyle = onAccent;
  ctx.fillText(SHARE.ask, x + 20, H - 86);

  ctx.font = '400 54px "Bangers", Impact, sans-serif';
  ctx.fillStyle = p.text;
  const tw = ctx.measureText(SHARE.ticker).width;
  ctx.fillText(SHARE.ticker, W - 44 - tw, H - 50);

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
export async function shareMyView({ view, svg }) {
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
    blob = await makeShareCard({ view, svg });
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
