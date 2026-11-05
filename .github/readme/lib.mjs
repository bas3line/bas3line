// Shared pieces for the profile README's SVGs: fonts drawn as paths (so every
// reader sees Geist, whatever is installed), the two themes, and small parts.
import opentype from "opentype.js";
import { readFileSync } from "node:fs";

const dir = new URL("./node_modules/geist/dist/fonts/", import.meta.url);
const load = (p) => opentype.parse(readFileSync(new URL(p, dir)).buffer);

export const FONTS = {
  regular: load("geist-sans/Geist-Regular.ttf"),
  medium: load("geist-sans/Geist-Medium.ttf"),
  semibold: load("geist-sans/Geist-SemiBold.ttf"),
  mono: load("geist-mono/GeistMono-Regular.ttf"),
  monoMedium: load("geist-mono/GeistMono-Medium.ttf"),
};

export const THEMES = {
  light: {
    dark: false,
    bg: "#ffffff",
    ink: "#0a0a0a",
    ink2: "#4d4d4d",
    ink3: "#8a8d93",
    line: "#e6e7eb",
    blue: "#2563eb",
    blueDeep: "#1d3fae",
    blueSoft: "#eef3fe",
    blueLine: "#c9d8fb",
    tint: "#f6f8fd",
    card: "#ffffff",
    dot: "#c9d8fb",
    pill: "#0a0a0a",
    pillInk: "#ffffff",
    art: ["#b7cbf6", "#5b8cf0", "#1d3fae"],
    glint: "#0a0a0a",
  },
  dark: {
    dark: true,
    bg: "#0d1117",
    ink: "#f0f6fc",
    ink2: "#9198a1",
    ink3: "#6e7681",
    line: "#262c36",
    blue: "#4493f8",
    blueDeep: "#a5c8ff",
    blueSoft: "#0f1b30",
    blueLine: "#1f3760",
    tint: "#0f1520",
    card: "#0d1117",
    dot: "#22406e",
    pill: "#f0f6fc",
    pillInk: "#0d1117",
    art: ["#25426f", "#4a86ea", "#c6dcff"],
    glint: "#ffffff",
  },
};

const r1 = (n) => Math.round(n * 10) / 10;

export function measure(str, { font = "regular", size = 16, tracking = 0 } = {}) {
  return FONTS[font].getAdvanceWidth(str, size, { kerning: true, letterSpacing: tracking });
}

// text as a filled path; returns { svg, width }
export function text(str, { x = 0, y = 0, font = "regular", size = 16, tracking = 0, fill = "#000", anchor = "start", opacity, cls } = {}) {
  const width = measure(str, { font, size, tracking });
  const x0 = anchor === "end" ? x - width : anchor === "middle" ? x - width / 2 : x;
  // opentype's own toPathData(1) prints NaN for some coordinates, so format here
  const d = FONTS[font]
    .getPath(str, x0, y, size, { kerning: true, letterSpacing: tracking })
    .commands.map((c) =>
      c.type === "Z" ? "Z"
      : c.type === "Q" ? `Q${r1(c.x1)} ${r1(c.y1)} ${r1(c.x)} ${r1(c.y)}`
      : c.type === "C" ? `C${r1(c.x1)} ${r1(c.y1)} ${r1(c.x2)} ${r1(c.y2)} ${r1(c.x)} ${r1(c.y)}`
      : `${c.type}${r1(c.x)} ${r1(c.y)}`,
    )
    .join("");
  const attrs = [`d="${d}"`, `fill="${fill}"`];
  if (opacity != null) attrs.push(`opacity="${opacity}"`);
  if (cls) attrs.push(`class="${cls}"`);
  return { svg: `<path ${attrs.join(" ")}/>`, width, x: x0 };
}

// greedy word wrap by measured width
export function wrap(str, max, opts) {
  const words = str.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next, opts) > max) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function paragraph(str, { x, y, max, lineHeight, ...opts }) {
  return wrap(str, max, opts)
    .map((l, i) => text(l, { x, y: y + i * lineHeight, ...opts }).svg)
    .join("");
}

export const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function doc({ w, h, label, t, body, style = "", bg = true }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" fill="none"><title>${esc(label)}</title><style>${style}@media (prefers-reduced-motion:reduce){*{animation:none!important}.motion{display:none}}</style>${bg ? `<rect width="${w}" height="${h}" fill="${t.bg}"/>` : ""}${body}</svg>`;
}

// a dotted-grid fill, turtle's panel texture
export function dotPattern(id, t, { gap = 8, r = 1 } = {}) {
  return `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"><circle cx="${gap / 2}" cy="${gap / 2}" r="${r}" fill="${t.dot}"/></pattern>`;
}

// the framed panel: a tinted rim of dots, and a dashed inner edge
export function panel(id, t, { x, y, w, h, rim = 12, rx = 14 }) {
  return (
    `<defs>${dotPattern(id, t)}</defs>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${t.tint}" stroke="${t.blueLine}"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${id})"/>` +
    `<rect x="${x + rim}" y="${y + rim}" width="${w - rim * 2}" height="${h - rim * 2}" rx="${Math.max(2, rx - rim / 2)}" fill="${t.card}" stroke="${t.blueLine}" stroke-dasharray="2 3"/>`
  );
}

// a pill chip with mono text; returns { svg, width }
export function chip(label, t, { x, y, size = 14, h = 30, pad = 12, fill, stroke, ink, font = "mono" } = {}) {
  const tw = measure(label, { font, size });
  const w = tw + pad * 2;
  const svg =
    `<rect x="${r1(x)}" y="${y}" width="${r1(w)}" height="${h}" rx="${h / 2}" fill="${fill ?? t.card}" stroke="${stroke ?? t.line}"/>` +
    text(label, { x: x + pad, y: y + h / 2 + size * 0.36, size, font, fill: ink ?? t.ink2 }).svg;
  return { svg, width: w };
}

export function chips(labels, t, { x, y, gap = 8, ...o }) {
  let cx = x;
  let out = "";
  for (const l of labels) {
    const c = chip(l, t, { x: cx, y, ...o });
    out += c.svg;
    cx += c.width + gap;
  }
  return out;
}

export { r1 };
