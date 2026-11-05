// Project cards, turtle's "how it works" card: title and number, a line, tags,
// and a framed panel with a small moving picture of the thing.
import { svg as asciiSvg, namespaced, MONO, FACES } from "ascii.rest/svg";
import { donut } from "ascii.rest/pieces";
import { chips, doc, esc, measure, panel, paragraph, text } from "./lib.mjs";

const W = 600;
const H = 520;

function card(t, { n, title, desc, tags, label, visual }) {
  let b =
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="${t.tint}" stroke="${t.blueLine}"/>` +
    `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="17" fill="${t.card}" stroke="${t.blueLine}"/>`;
  b += text(title, { x: 36, y: 68, font: "medium", size: 30, tracking: -0.025, fill: t.ink }).svg;
  b += text(n, { x: W - 36, y: 66, font: "mono", size: 15, fill: t.blue, anchor: "end" }).svg;
  b += paragraph(desc, { x: 36, y: 106, max: 520, lineHeight: 27, size: 18, fill: t.ink2 });
  b += chips(tags, t, { x: 36, y: 162, size: 13.5, h: 30, pad: 12 });
  b += panel("p", t, { x: 30, y: 212, w: W - 60, h: H - 242 });
  const box = { x: 42, y: 224, w: W - 84, h: H - 266 };
  const v = visual(t, box);
  return doc({ w: W, h: H, t, label, style: v.style ?? "", body: b + v.svg });
}

const check = (x, y, color) =>
  `<path d="M${x} ${y}l4 4l8-9" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

const arrowButton = (t, x, y, s = 32) =>
  `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="8" fill="${t.blue}"/>` +
  `<path d="M${x + s * 0.3} ${y + s / 2}H${x + s * 0.7}M${x + s / 2} ${y + s * 0.32}L${x + s * 0.7} ${y + s / 2}L${x + s / 2} ${y + s * 0.68}" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

// ---------------------------------------------------------------- ascii
function asciiVisual(t, box) {
  const size = 12;
  const adv = measure("a", { font: "mono", size });
  const lines = [
    [["<", t.ink3], ["script", t.ink], [" type", t.ink3], ["=", t.ink3], ['"module"', t.blue]],
    [["  src", t.ink3], ["=", t.ink3], ['"https://ascii.rest/ascii.js"', t.blue], [">", t.ink3]],
    [["</", t.ink3], ["script", t.ink], [">", t.ink3]],
    [],
    [["<", t.ink3], ["ascii-art", t.ink], [" piece", t.ink3], ["=", t.ink3], ['"donut"', t.blue], [">", t.ink3]],
    [["</", t.ink3], ["ascii-art", t.ink], [">", t.ink3]],
  ];
  let s = "";
  const x0 = box.x + 22;
  let y = box.y + 58;
  for (const line of lines) {
    let col = 0;
    for (const [str, fill] of line) {
      s += text(str, { x: x0 + col * adv, y, font: "mono", size, fill }).svg;
      col += str.length;
    }
    y += 23;
  }
  s += text("No install, no build step.", { x: x0, y: y + 22, size: 14, fill: t.ink3 }).svg;

  // the real donut, from ascii.rest's own SVG writer
  const part = namespaced(asciiSvg(donut, { ink: t.blue, dark: t.dark, fps: 12, seconds: 4 }), "dn");
  const dh = box.h - 44;
  const dw = (dh * part.width) / part.height;
  s += `<svg x="${box.x + box.w - dw - 12}" y="${box.y + 22}" width="${dw}" height="${dh}" viewBox="0 0 ${part.width} ${part.height}">${part.body}</svg>`;
  return { svg: s, style: MONO + part.css };
}

// ---------------------------------------------------------------- agent office
function officeVisual(t, box) {
  const u = 4;
  const ox = box.x, oy = box.y;
  const px = (x, y, w, h, fill, extra = "") => `<rect x="${ox + x * u}" y="${oy + y * u}" width="${w * u}" height="${h * u}" fill="${fill}"${extra}/>`;
  const cols = Math.floor(box.w / u), rows = Math.floor(box.h / u);
  const wall = t.dark ? "#111a2a" : "#eef3fe";
  const floor = t.dark ? "#0b111b" : "#f6f8fd";
  const trim = t.dark ? "#22406e" : "#c9d8fb";
  const desk = t.dark ? "#3b4252" : "#c7cbd3";
  const deskDark = t.dark ? "#2a303c" : "#a9aeb8";
  const skin = "#f1c7a2";
  const hair = t.dark ? "#d7dde6" : "#2b2f36";
  let s = "";
  s += px(0, 0, cols, 38, wall) + px(0, 38, cols, rows - 38, floor) + px(0, 38, cols, 1, trim);
  // window on the back wall, a sky with one cloud
  s += px(74, 6, 30, 16, trim) + px(75, 7, 28, 14, t.dark ? "#16294a" : "#dbe7ff") + px(80, 11, 6, 2, t.card) + px(78, 12, 10, 2, t.card);
  // the lift
  s += px(4, 8, 18, 30, trim) + px(5, 10, 16, 28, t.dark ? "#1b2638" : "#dfe6f3");
  s += `<g class="door-l">${px(5, 10, 8, 28, t.dark ? "#2c3b55" : "#c3cfe4")}</g><g class="door-r">${px(13, 10, 8, 28, t.dark ? "#2c3b55" : "#c3cfe4")}</g>`;
  s += px(11, 5, 4, 2, t.blue);

  const agents = [
    { name: "claude", color: "#d97757", x: 30 },
    { name: "codex", color: t.dark ? "#e6edf3" : "#1f2328", x: 60 },
    { name: "command", color: t.blue, x: 90 },
  ];
  for (const [i, a] of agents.entries()) {
    const x = a.x, y = 44;
    // chair back, then the worker, then the desk in front
    s += px(x + 2, y - 9, 9, 10, t.dark ? "#262c36" : "#dcdfe5");
    s += px(x + 3, y - 15, 6, 6, skin) + px(x + 3, y - 15, 6, 2, hair) + px(x + 7, y - 13, 1, 1, "#1f2328");
    s += px(x + 2, y - 9, 8, 8, a.color);
    s += px(x - 2, y - 1, 30, 2, desk) + px(x - 1, y + 1, 1, 8, deskDark) + px(x + 26, y + 1, 1, 8, deskDark);
    // monitor and its screen
    s += px(x + 13, y - 12, 13, 10, t.dark ? "#3b4252" : "#2b2f36") + px(x + 14, y - 11, 11, 8, "#0d1117") + px(x + 19, y - 2, 1, 1, deskDark);
    const lineColors = [a.color, "#7ee787", "#8b949e"];
    for (let k = 0; k < 3; k++) {
      const w = [7, 9, 5][(k + i) % 3];
      s += `<rect class="type type${k}" style="animation-delay:${(i * 0.7 + k * 0.35).toFixed(2)}s" x="${ox + (x + 15) * u}" y="${oy + (y - 10 + k * 2) * u + 1}" width="${w * u}" height="${u - 1}" fill="${lineColors[k]}"/>`;
    }
    s += text(a.name, { x: ox + (x + 12) * u, y: oy + (y + 15) * u, font: "mono", size: 13, fill: t.ink3, anchor: "middle" }).svg;
  }
  // claude is thinking
  const tx = ox + (30 + 6) * u, ty = oy + 44 * u - 19 * u;
  s += `<g class="think">${[0, 1, 2].map((k) => `<circle class="dot dot${k}" cx="${tx + k * 9}" cy="${ty - k * 5}" r="${2 + k}" fill="${t.ink3}"/>`).join("")}</g>`;
  // codex has its hand up: it is waiting on you
  const hx = ox + (60 + 5) * u, hy = oy + (44 - 24) * u;
  s += `<g class="bob"><rect x="${hx}" y="${hy}" width="${5 * u}" height="${6 * u}" rx="3" fill="#f2b33d"/>${text("!", { x: hx + 2.5 * u, y: hy + 4.9 * u, font: "semibold", size: 17, fill: "#1f2328", anchor: "middle" }).svg}</g>`;
  s += px(60 + 10, 44 - 13, 2, 5, skin, ` class="bob"`);
  // an intern walks out of the lift
  const ix = 9, iy = 44 + 6;
  s += `<g class="intern">${px(ix + 1, iy - 12, 4, 4, skin)}${px(ix + 1, iy - 12, 4, 1, hair)}${px(ix, iy - 8, 6, 6, "#8e75ff")}${px(ix + 1, iy - 2, 1, 3, hair)}${px(ix + 4, iy - 2, 1, 3, hair)}</g>`;

  const style =
    `.type{transform-box:fill-box;transform-origin:left;animation:type 2.4s steps(6) infinite}` +
    `@keyframes type{0%{transform:scaleX(0)}60%,100%{transform:scaleX(1)}}` +
    `.dot{animation:fade 2.4s ease-in-out infinite}.dot1{animation-delay:.3s}.dot2{animation-delay:.6s}@keyframes fade{0%,100%{opacity:.15}50%{opacity:1}}` +
    `.bob{animation:bob 1.2s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-4px)}}` +
    `.intern{animation:walk 9s linear infinite}@keyframes walk{0%,8%{transform:translateX(0);opacity:0}12%{opacity:1}55%{transform:translateX(${16 * u}px)}75%{transform:translateX(${16 * u}px);opacity:1}82%,100%{transform:translateX(${16 * u}px);opacity:0}}` +
    `.door-l,.door-r{transform-box:fill-box;animation:door 9s ease-in-out infinite}.door-l{transform-origin:left}.door-r{transform-origin:right}@keyframes door{0%,2%{transform:scaleX(1)}8%,16%{transform:scaleX(.15)}22%,100%{transform:scaleX(1)}}`;
  return { svg: s, style };
}

// ---------------------------------------------------------------- airsec
function airsecVisual(t, box) {
  let s = "";
  const x0 = box.x + 20;
  let x = x0;
  const tabs = ["Claude Code", "Codex", "OpenCode", "Command Code"];
  for (const [i, tab] of tabs.entries()) {
    const w = measure(tab, { size: 13.5 }) + 22;
    if (i === 0) s += `<rect x="${x}" y="${box.y + 18}" width="${w}" height="28" rx="7" fill="${t.blueSoft}"/>`;
    s += text(tab, { x: x + 11, y: box.y + 37, size: 13.5, fill: i === 0 ? t.blue : t.ink3 }).svg;
    x += w + 4;
  }
  const iy = box.y + 58, iw = box.w - 40;
  s += `<rect x="${x0}" y="${iy}" width="${iw}" height="46" rx="10" fill="${t.card}" stroke="${t.line}"/>`;
  s += text("$ npx airsec@latest init", { x: x0 + 16, y: iy + 28.5, font: "mono", size: 14.5, fill: t.ink }).svg;
  s += arrowButton(t, x0 + iw - 39, iy + 7);
  const steps = ["Maps the attack surface before it hunts", "14 audit modules, four search strategies each", "Reviewers try to refute every finding"];
  for (const [i, st] of steps.entries()) {
    const y = iy + 80 + i * 30;
    s += `<g class="step step${i}">${check(x0 + 2, y - 7, t.blue)}${text(st, { x: x0 + 26, y, size: 15, fill: t.ink2 }).svg}</g>`;
  }
  // all three done at first sight; then they reset and tick through again
  const style =
    `.step{animation:9s ease-out infinite}.step0{animation-name:s0}.step1{animation-name:s1}.step2{animation-name:s2}` +
    `@keyframes s0{0%,62%{opacity:1}66%,70%{opacity:.18}74%,100%{opacity:1}}` +
    `@keyframes s1{0%,62%{opacity:1}66%,78%{opacity:.18}82%,100%{opacity:1}}` +
    `@keyframes s2{0%,62%{opacity:1}66%,86%{opacity:.18}90%,100%{opacity:1}}`;
  return { svg: s, style };
}

// ---------------------------------------------------------------- gopher
function gopherVisual(t, box) {
  let s = "";
  const x0 = box.x + 20;
  const msg = (y, avatar, name, badge, time, body, cls = "") => {
    let m = `<g class="${cls}">`;
    m += avatar(x0 + 18, y + 18);
    const nm = text(name, { x: x0 + 48, y: y + 12, font: "medium", size: 15, fill: t.ink });
    m += nm.svg;
    let tx = x0 + 48 + nm.width + 8;
    if (badge) {
      m += `<rect x="${tx}" y="${y}" width="30" height="16" rx="4" fill="${t.blue}"/>` + text("APP", { x: tx + 15, y: y + 11.5, font: "semibold", size: 9.5, fill: "#fff", anchor: "middle" }).svg;
      tx += 38;
    }
    m += text(time, { x: tx, y: y + 12, font: "mono", size: 11.5, fill: t.ink3 }).svg;
    m += paragraph(body, { x: x0 + 48, y: y + 35, max: box.w - 100, lineHeight: 22, size: 15, fill: t.ink2 });
    return m + "</g>";
  };
  const you = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="16" fill="${t.line}"/>` + text("k", { x: cx, y: cy + 5.5, font: "medium", size: 16, fill: t.ink2, anchor: "middle" }).svg;
  const bot = (cx, cy) =>
    `<circle cx="${cx}" cy="${cy}" r="16" fill="${t.blue}"/>` +
    // a small gopher face: ears, eyes and two front teeth
    `<circle cx="${cx - 8}" cy="${cy - 9}" r="3" fill="#fff"/><circle cx="${cx + 8}" cy="${cy - 9}" r="3" fill="#fff"/><circle cx="${cx}" cy="${cy + 1}" r="9" fill="#fff"/><circle cx="${cx - 3.5}" cy="${cy - 1}" r="1.6" fill="#1f2328"/><circle cx="${cx + 3.5}" cy="${cy - 1}" r="1.6" fill="#1f2328"/><rect x="${cx - 2}" y="${cy + 4}" width="4" height="4" fill="${t.blue}"/>`;
  s += msg(box.y + 18, you, "kira", false, "today at 9:41", "@Gopher what did we land on for the launch?");
  s += msg(box.y + 96, bot, "Gopher", true, "today at 9:41", "Friday, once the migration ships. You agreed in #launch on Tuesday, so I kept it.", "reply");
  // typing, then the answer
  const ty = box.y + 120;
  s += `<g class="typing"><rect x="${x0 + 48}" y="${ty}" width="54" height="26" rx="13" fill="${t.blueSoft}"/>${[0, 1, 2].map((k) => `<circle class="td td${k}" cx="${x0 + 63 + k * 12}" cy="${ty + 13}" r="3.2" fill="${t.blue}"/>`).join("")}</g>`;
  s += `<g class="reply-tags">${chips(["memory", "web", "vision", "voice"], t, { x: x0 + 48, y: box.y + 196, size: 12, h: 24, pad: 9, fill: t.blueSoft, stroke: t.blueSoft, ink: t.blue })}</g>`;
  // the answer is there at first sight; now and then it is typed again
  const style =
    `.typing{opacity:0}.reply,.reply-tags{animation:reply 10s ease-out infinite}.typing{animation:typing 10s linear infinite}` +
    `@keyframes reply{0%,66%{opacity:1}69%,86%{opacity:0}90%,100%{opacity:1}}` +
    `@keyframes typing{0%,69%{opacity:0}71%,86%{opacity:1}88%,100%{opacity:0}}` +
    `.td{animation:td 1s ease-in-out infinite}.td1{animation-delay:.15s}.td2{animation-delay:.3s}@keyframes td{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`;
  return { svg: s, style };
}

// ---------------------------------------------------------------- tplay
const BRAILLE = 0x2800;
function brailleFrames({ cols, rows, frames }) {
  const W = cols * 2, H = rows * 4;
  const out = [];
  for (let f = 0; f < frames; f++) {
    const ph = (f / frames) * Math.PI * 2;
    const on = (x, y) => {
      // a moon, its light on the water, and waves rolling under it
      const mx = W * 0.72, my = H * 0.26, mr = H * 0.17;
      if ((x - mx) ** 2 + ((y - my) * 1.0) ** 2 < mr * mr) return true;
      const sea = H * 0.56 + Math.sin(x * 0.11 + ph) * 1.6;
      if (y < sea) {
        // a few stars that twinkle
        const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return h - Math.floor(h) > 0.992 && (x + y + f) % 3 !== 0;
      }
      const depth = (y - sea) / (H - sea);
      const wave = Math.sin(x * 0.18 - ph * 2 + y * 0.9) + Math.sin(x * 0.07 + ph + y * 0.4);
      const glow = Math.abs(x - mx) < 12 - depth * 3 && Math.sin(y * 2.1 + ph * 3 + x * 0.3) > -0.5;
      // ordered dither: the deeper the water, the more dots are lit
      const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]][y & 3][x & 3] / 16;
      return glow || wave > 0.7 - depth * 1.3 || bayer < depth * 0.45;
    };
    const lines = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const bx = c * 2, by = r * 4;
        let bits = 0;
        const map = [[0, 0, 0x01], [0, 1, 0x02], [0, 2, 0x04], [1, 0, 0x08], [1, 1, 0x10], [1, 2, 0x20], [0, 3, 0x40], [1, 3, 0x80]];
        for (const [dx, dy, bit] of map) if (on(bx + dx, by + dy)) bits |= bit;
        line += String.fromCharCode(BRAILLE + bits);
      }
      lines.push(line);
    }
    out.push(lines);
  }
  return out;
}

function tplayVisual(t, box) {
  let s = "";
  const wx = box.x + 16, wy = box.y + 14, ww = box.w - 32, wh = box.h - 28;
  const term = "#0b0f14";
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="10" fill="${term}" stroke="${t.dark ? "#30363d" : "#1f2328"}"/>`;
  for (const [i, c] of ["#ff5f57", "#febc2e", "#28c840"].entries()) s += `<circle cx="${wx + 16 + i * 15}" cy="${wy + 14}" r="4.5" fill="${c}"/>`;
  s += text("tplay clip.mp4 --dots", { x: wx + ww / 2, y: wy + 18, font: "mono", size: 12, fill: "#8b949e", anchor: "middle" }).svg;

  const cols = 64, rows = 8, frames = 8, every = 2.4;
  const fr = brailleFrames({ cols, rows, frames });
  const gx = wx + 16, gy = wy + 34, gw = ww - 32, rh = 14.5;
  for (const [i, lines] of fr.entries()) {
    s += `<g class="bf bf${i}" style="animation-delay:${(-every + (i * every) / frames).toFixed(3)}s">`;
    for (const [r, line] of lines.entries()) {
      const color = r < 4 ? "#a5c8ff" : "#4493f8";
      s += `<text x="${gx}" y="${gy + r * rh + rh / 2}" textLength="${gw}" lengthAdjust="spacingAndGlyphs" fill="${color}">${esc(line)}</text>`;
    }
    s += `</g>`;
  }
  // the player's bar: play, a scrubber, the time, and the picture modes
  const by = wy + wh - 22;
  s += `<path d="M${gx} ${by - 5}l9 5l-9 5z" fill="#e6edf3"/>`;
  const tx0 = gx + 22, tw = 140;
  s += `<rect x="${tx0}" y="${by - 1.5}" width="${tw}" height="3" rx="1.5" fill="#30363d"/><rect class="scrub" x="${tx0}" y="${by - 1.5}" width="${tw}" height="3" rx="1.5" fill="#4493f8"/>`;
  s += text("0:12 / 1:04", { x: tx0 + tw + 12, y: by + 4.5, font: "mono", size: 12, fill: "#8b949e" }).svg;
  let mx = gx + gw;
  for (const m of ["ascii", "braille", "half"]) {
    const w = measure(m, { font: "mono", size: 12 });
    mx -= w;
    if (m === "braille") s += `<rect x="${mx - 6}" y="${by - 10}" width="${w + 12}" height="20" rx="5" fill="#1f3760"/>`;
    s += text(m, { x: mx, y: by + 4.5, font: "mono", size: 12, fill: m === "braille" ? "#a5c8ff" : "#6e7681" }).svg;
    mx -= 18;
  }
  const style =
    `text{font-family:${FACES};font-size:13px;white-space:pre;dominant-baseline:central}` +
    `.bf{opacity:0;animation:bf ${every}s step-end infinite}.bf0{opacity:1}@keyframes bf{0%{opacity:1}${(100 / frames).toFixed(3)}%,100%{opacity:0}}` +
    `.scrub{transform-box:fill-box;transform-origin:left;animation:scrub 12s linear infinite}@keyframes scrub{0%{transform:scaleX(.08)}100%{transform:scaleX(1)}}`;
  return { svg: s, style };
}

// ---------------------------------------------------------------- lineup
function lineupVisual(t, box) {
  let s = "";
  const sw = 300, sh = 176;
  const sx = box.x + (box.w - sw) / 2, sy = box.y + 26;
  const widths = [170, 220, 150, 200, 170, 190];
  const gap = 10, wy = sy + 24, wh = sh - 36;
  let row = "";
  let x = sx + 10 - 0;
  for (const [i, w] of widths.entries()) {
    const focus = i === 2;
    row += `<rect x="${x}" y="${wy}" width="${w}" height="${wh}" rx="7" fill="${t.card}" stroke="${focus ? t.blue : t.line}" stroke-width="${focus ? 2 : 1}"/>`;
    row += `<rect x="${x}" y="${wy}" width="${w}" height="16" rx="7" fill="${focus ? t.blueSoft : t.tint}"/><rect x="${x}" y="${wy + 9}" width="${w}" height="7" fill="${focus ? t.blueSoft : t.tint}"/>`;
    for (let k = 0; k < 3; k++) row += `<circle cx="${x + 9 + k * 8}" cy="${wy + 8}" r="2.3" fill="${t.line}"/>`;
    for (let k = 0; k < 5; k++) {
      const lw = (w - 24) * [0.85, 0.6, 0.75, 0.4, 0.65][(k + i) % 5];
      row += `<rect x="${x + 12}" y="${wy + 28 + k * 18}" width="${lw}" height="7" rx="3.5" fill="${focus ? t.blueLine : t.line}"/>`;
    }
    x += w + gap;
  }
  // the row is wider than the screen: show it faint outside, whole inside
  s += `<defs><clipPath id="screen"><rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="12"/></clipPath><clipPath id="outside"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"/></clipPath></defs>`;
  s += `<g clip-path="url(#outside)"><g class="row" opacity=".28">${row}</g></g>`;
  s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="12" fill="${t.bg}"/>`;
  s += `<g clip-path="url(#screen)"><g class="row">${row}</g><rect x="${sx}" y="${sy}" width="${sw}" height="16" fill="${t.dark ? "#161b22" : "#f0f1f4"}"/></g>`;
  s += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="12" fill="none" stroke="${t.ink3}" stroke-width="1.5"/>`;
  s += `<circle cx="${sx + 12}" cy="${sy + 8}" r="2.5" fill="${t.ink3}"/>`;
  s += text("ctrl + option + scroll", { x: box.x + box.w / 2, y: sy + sh + 28, font: "mono", size: 13, fill: t.ink3, anchor: "middle" }).svg;
  // slide along the row: rest, glide, rest
  const stop = (i) => -(widths.slice(0, i).reduce((a, b) => a + b + gap, 0)) + (sw - widths[i]) / 2 - 10;
  const p = [stop(1), stop(2), stop(3), stop(2)];
  const style =
    `.row{transform:translateX(${p[0]}px);animation:slide 12s cubic-bezier(.65,0,.35,1) infinite}` +
    `@keyframes slide{0%,18%{transform:translateX(${p[0]}px)}25%,43%{transform:translateX(${p[1]}px)}50%,68%{transform:translateX(${p[2]}px)}75%,93%{transform:translateX(${p[3]}px)}100%{transform:translateX(${p[0]}px)}}`;
  return { svg: s, style };
}

export const CARDS = {
  "card-ascii": (t) =>
    card(t, {
      n: "01",
      title: "ascii",
      desc: "Animated ascii art for web pages, in TypeScript: React, Next.js, Astro, or one HTML tag.",
      tags: ["TypeScript", "240 pieces", "ascii.rest"],
      label: "ascii: animated ascii art for web pages, with a spinning ascii donut",
      visual: asciiVisual,
    }),
  "card-agent-office": (t) =>
    card(t, {
      n: "02",
      title: "agent office",
      desc: "Your coding agents working in a live pixel-art office: Claude Code, Codex, Command Code and five more.",
      tags: ["TypeScript", "local or sandboxed", "npx theagentoffice"],
      label: "agent office: coding agents as pixel-art workers at desks",
      visual: officeVisual,
    }),
  "card-airsec": (t) =>
    card(t, {
      n: "03",
      title: "airsec",
      desc: "Security review driven by the coding CLI you already have. No new API key, no cloud upload.",
      tags: ["TypeScript", "Node 20+", "npx airsec"],
      label: "airsec: security review driven by your coding CLI",
      visual: airsecVisual,
    }),
  "card-gopher": (t) =>
    card(t, {
      n: "04",
      title: "Gopher",
      desc: "An AI Discord bot with long-term memory, web research, vision and voice replies.",
      tags: ["TypeScript", "Bun", "pgvector"],
      label: "Gopher: an AI Discord bot that remembers",
      visual: gopherVisual,
    }),
  "card-tplay": (t) =>
    card(t, {
      n: "05",
      title: "tplay",
      desc: "Play videos in your terminal, with sound: half-block colour, dithered braille dots, or ascii.",
      tags: ["Rust", "ffmpeg", "3 picture modes"],
      label: "tplay: video in the terminal, drawn in braille dots",
      visual: tplayVisual,
    }),
  "card-lineup": (t) =>
    card(t, {
      n: "06",
      title: "Lineup",
      desc: "A calm, scrolling window manager for macOS. Your windows stay side by side in one tidy row.",
      tags: ["Swift", "macOS 13+", "MIT"],
      label: "Lineup: a scrolling window manager for macOS",
      visual: lineupVisual,
    }),
};
