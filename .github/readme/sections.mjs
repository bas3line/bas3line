// Everything full-width or small that isn't the hero or a project card:
// section headings, the timeline, the work wall, page frames and buttons.
import { readFileSync } from "node:fs";
import { doc, measure, paragraph, text } from "./lib.mjs";

const W = 1280;

// ---------------------------------------------------------------- headings
export function heading(t, { eyebrow, plain, accent, sub, label }) {
  const size = 58;
  let b = text(eyebrow, { x: 48, y: 62, font: "mono", size: 15, tracking: 0.12, fill: t.ink3 }).svg;
  const p = text(plain, { x: 45, y: 136, font: "medium", size, tracking: -0.04, fill: t.ink });
  b += p.svg;
  b += text(accent, { x: 45 + p.width + size * 0.26, y: 136, font: "medium", size, tracking: -0.04, fill: t.blue }).svg;
  let h = 170;
  if (sub) {
    b += paragraph(sub, { x: 48, y: 186, max: 760, lineHeight: 30, size: 20, fill: t.ink2 });
    h = 230;
  }
  return doc({ w: W, h, t, label: label ?? `${plain} ${accent}`, body: b });
}

// ---------------------------------------------------------------- timeline
// Public repos by the day GitHub says they were created.
const SHIPPED = [
  ["2026-07-15", "watchman"],
  ["2026-07-19", "sandbox"],
  ["2026-07-23", "context bridge"],
  ["2026-07-29", "gopher", 1],
  ["2026-08-14", "airsec", 1],
  ["2026-09-11", "tplay"],
  ["2026-09-21", "penna + s3lean"],
  ["2026-10-07", "ascii", 2],
  ["2026-10-10", "amv"],
  ["2026-10-13", "lineup"],
  ["2026-10-18", "agent office", 1],
  ["2026-10-22", "nodeny"],
  ["2026-10-23", "turtle"],
  ["2026-10-28", "pi-boat"],
  ["2026-11-01", "components"],
];

export function timeline(t, { now = "2026-11-05" } = {}) {
  const H = 330;
  const day = (s) => Date.parse(`${s}T00:00:00Z`) / 864e5;
  const d0 = day("2026-07-08"), d1 = day(now);
  const x0 = 70, x1 = 1170;
  const X = (s) => x0 + ((day(s) - d0) / (d1 - d0)) * (x1 - x0);
  const base = 214;
  let b = "";
  b += `<defs><pattern id="g" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1" fill="${t.line}"/></pattern></defs>`;
  b += `<rect x="0" y="62" width="${W}" height="${H - 62}" fill="url(#g)"/>`;
  b += `<path d="M0 0.5H${W}M0 62H${W}M0 ${H - 0.5}H${W}" stroke="${t.line}"/>`;
  // the line in words, centred like anomaly's
  const a = "What I shipped in public since July, as one line. It stays flat until ";
  const c = "something ships.";
  const tw = measure(a, { size: 17 }) + measure(c, { size: 17 });
  const tx = (W - tw) / 2 + 10;
  b += `<circle cx="${tx - 16}" cy="31" r="5" fill="${t.blue}"/>`;
  const ta = text(a, { x: tx, y: 37, size: 17, fill: t.ink2 });
  b += ta.svg + text(c, { x: tx + ta.width, y: 37, size: 17, fill: t.blue }).svg;

  // the trace: a quiet wobble, and a ring-down after each release
  const events = SHIPPED.map(([d, name, big = 0]) => ({ x: X(d), name, big }));
  const pts = [];
  for (let x = x0; x <= x1; x += 1.5) {
    let y = Math.sin(x * 0.21) * 0.9 + Math.sin(x * 0.057) * 0.7;
    for (const e of events) {
      const dx = x - e.x;
      if (dx >= -2 && dx < 60) {
        const amp = [16, 26, 40][e.big];
        y += Math.sin(dx * 0.62) * amp * Math.exp(-Math.max(0, dx) / 11);
      }
    }
    pts.push(`${x.toFixed(1)} ${(base + y).toFixed(1)}`);
  }
  b += `<path d="M${pts.join("L")}" stroke="${t.ink3}" stroke-width="1.4" fill="none" stroke-linejoin="round"/>`;

  // each label takes the highest row where it clears the labels already
  // placed, so the busy October doesn't pile up
  const levels = [88, 110, 132, 154];
  const placed = levels.map(() => []);
  events.forEach((e) => {
    const from = e.x - 6, to = e.x + 7 + measure(e.name, { font: "mono", size: 13.5 }) + 10;
    let lv = levels.findIndex((_, k) => placed[k].every(([a, z]) => to < a || from > z));
    if (lv < 0) lv = levels.length - 1;
    placed[lv].push([from, to]);
    const ly = levels[lv];
    const strong = e.big > 0;
    b += `<path d="M${e.x.toFixed(1)} ${ly + 6}V${base - 8}" stroke="${strong ? t.blue : t.ink3}" stroke-dasharray="2 3" opacity="${strong ? 0.7 : 0.45}"/>`;
    b += `<circle cx="${e.x.toFixed(1)}" cy="${ly - 4}" r="3" fill="${strong ? t.blue : t.ink3}"/>`;
    b += text(e.name, { x: e.x + 7, y: ly, font: "mono", size: 13.5, fill: strong ? t.blue : t.ink2 }).svg;
  });
  // months along the bottom
  for (const [m, d] of [["jul", "2026-07-08"], ["aug", "2026-08-01"], ["sep", "2026-09-01"], ["oct", "2026-10-01"], ["nov", "2026-11-01"]]) {
    const x = Math.max(x0, X(d));
    b += `<path d="M${x.toFixed(1)} ${H - 52}V${H - 44}" stroke="${t.ink3}"/>`;
    b += text(m, { x: x + 5, y: H - 26, font: "mono", size: 13, fill: t.ink3 }).svg;
  }
  // now: a live dot
  b += `<path d="M${x1} 70V${H - 44}" stroke="${t.line}"/>`;
  b += `<circle class="ping" cx="${x1}" cy="${base}" r="6" fill="${t.blue}" opacity=".35"/><circle cx="${x1}" cy="${base}" r="4.5" fill="${t.blue}" stroke="${t.bg}" stroke-width="2"/>`;
  b += text("now", { x: x1 + 12, y: H - 26, font: "mono", size: 13, fill: t.ink3 }).svg;
  const style = `.ping{transform-box:fill-box;transform-origin:center;animation:ping 2s ease-out infinite}@keyframes ping{0%{transform:scale(1);opacity:.45}100%{transform:scale(3.2);opacity:0}}`;
  return doc({ w: W, h: H, t, style, label: `What I shipped in public since July, as one line: ${SHIPPED.map((s) => s[1]).join(", ")}`, body: b });
}

// ---------------------------------------------------------------- work wall
export function work(t, { chipsDir }) {
  const teams = [
    ["commandcode", "Command Code", "software engineer · now"],
    ["routing", "routing.run", "co-founder & cto · acquired"],
    ["megallm", "MegaLLM", "founding member"],
    ["dyntech", "DynTech", "software engineer"],
    ["groot", "Groot Music", "software engineer"],
    [null, "MemePay", "cto"],
  ];
  const H = 330, top = 62, cw = (W - 80) / 3, ch = (H - top) / 2;
  let b = `<path d="M0 0.5H${W}M0 ${top}H${W}M0 ${top + ch}H${W}M0 ${H - 0.5}H${W}M40 ${top}V${H}M${40 + cw} ${top}V${H}M${40 + cw * 2} ${top}V${H}M${W - 40} ${top}V${H}" stroke="${t.line}"/>`;
  for (const x of [40, 40 + cw, 40 + cw * 2, W - 40]) for (const y of [top, top + ch, H - 0.5]) b += `<circle cx="${x}" cy="${y}" r="3" fill="${t.bg}" stroke="${t.line}"/>`;
  const a = "Production I've shipped, and ";
  const c = "kept boring.";
  const tw = measure(a, { size: 17 }) + measure(c, { size: 17 });
  const ta = text(a, { x: (W - tw) / 2, y: 37, size: 17, fill: t.ink2 });
  b += ta.svg + text(c, { x: (W - tw) / 2 + ta.width, y: 37, size: 17, fill: t.blue }).svg;
  teams.forEach(([logo, name, role], i) => {
    const cx = 40 + cw * (i % 3) + cw / 2;
    const cy = top + ch * Math.floor(i / 3) + ch / 2;
    const nw = measure(name, { font: "medium", size: 24, tracking: -0.02 });
    const lw = 30, gap = 12;
    const sx = cx - (lw + gap + nw) / 2;
    if (logo) {
      const data = readFileSync(`${chipsDir}/${logo}.svg`).toString("base64");
      b += `<image x="${sx}" y="${cy - 30}" width="${lw}" height="${lw}" href="data:image/svg+xml;base64,${data}"/>`;
    } else {
      b += `<rect x="${sx}" y="${cy - 30}" width="${lw}" height="${lw}" rx="6" fill="${t.ink}"/>` + text("M", { x: sx + lw / 2, y: cy - 9, font: "semibold", size: 16, fill: t.bg, anchor: "middle" }).svg;
    }
    b += text(name, { x: sx + lw + gap, y: cy - 6, font: "medium", size: 24, tracking: -0.02, fill: t.ink }).svg;
    b += text(role, { x: cx, y: cy + 26, font: "mono", size: 14, fill: t.ink3, anchor: "middle" }).svg;
  });
  return doc({ w: W, h: H, t, label: `Work: ${teams.map((x) => `${x[1]}, ${x[2]}`).join("; ")}`, body: b });
}

// ---------------------------------------------------------------- page frames
export function page(t, { file, url, name, line }) {
  const PW = 600, iw = PW - 38, ih = Math.round((iw * 900) / 1440);
  const PH = 7 + 46 + ih + 86 + 7;
  const data = readFileSync(file).toString("base64");
  let b =
    `<rect x="0.5" y="0.5" width="${PW - 1}" height="${PH - 1}" rx="22" fill="${t.tint}" stroke="${t.blueLine}"/>` +
    `<rect x="7" y="7" width="${PW - 14}" height="${PH - 14}" rx="17" fill="${t.card}" stroke="${t.blueLine}"/>`;
  for (const [i, c] of [t.line, t.line, t.line].entries()) b += `<circle cx="${30 + i * 15}" cy="30" r="4.5" fill="${c}"/>`;
  const uw = measure(url, { font: "mono", size: 12.5 }) + 28;
  b += `<rect x="${(PW - uw) / 2}" y="17" width="${uw}" height="26" rx="13" fill="${t.tint}" stroke="${t.line}"/>`;
  b += text(url, { x: PW / 2, y: 34.5, font: "mono", size: 12.5, fill: t.ink3, anchor: "middle" }).svg;
  const ix = 19, iy = 53;
  b += `<defs><clipPath id="shot"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="8"/></clipPath></defs>`;
  b += `<image x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMin slice" clip-path="url(#shot)" href="data:image/jpeg;base64,${data}"/>`;
  b += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="8" fill="none" stroke="${t.line}"/>`;
  b += text(name, { x: 30, y: iy + ih + 38, font: "medium", size: 22, tracking: -0.02, fill: t.ink }).svg;
  b += text(line, { x: 30, y: iy + ih + 64, font: "mono", size: 13, fill: t.ink3 }).svg;
  return doc({ w: PW, h: PH, t, label: `${name}: ${url}`, body: b });
}

// ---------------------------------------------------------------- buttons
export function button(t, { label, kind = "outline", arrow = false }) {
  const size = 17, h = 52, pad = 24;
  const lw = measure(label, { font: "medium", size });
  const w = Math.ceil(lw + pad * 2 + (arrow ? 24 : 0)) + 4;
  const fill = kind === "solid" ? t.pill : kind === "blue" ? t.bg : t.bg;
  const stroke = kind === "solid" ? t.pill : kind === "blue" ? t.blue : t.line;
  const ink = kind === "solid" ? t.pillInk : kind === "blue" ? t.blue : t.ink;
  let b = `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${(h - 4) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  b += text(label, { x: 2 + pad, y: h / 2 + 6, font: "medium", size, fill: ink }).svg;
  if (arrow) {
    const ax = 2 + pad + lw + 12, ay = h / 2;
    b += `<path d="M${ax} ${ay}H${ax + 13}M${ax + 7.5} ${ay - 5.5}L${ax + 13} ${ay}L${ax + 7.5} ${ay + 5.5}" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return doc({ w, h, t, label, body: b, bg: false });
}
