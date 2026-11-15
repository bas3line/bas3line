// Project cards, turtle's "how it works" card: title and number, a line, tags,
// and a framed panel with a small moving picture of the thing.
import { svg as asciiSvg, namespaced, MONO, FACES } from "ascii.rest/svg";
import { donut } from "ascii.rest/pieces";
import { chips, doc, esc, measure, panel, paragraph, r1, text } from "./lib.mjs";

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
  const term = "#050506";
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="10" fill="${term}" stroke="${t.line}"/>`;
  for (const [i, c] of [t.blue, t.ink3, t.ink3].entries()) s += `<circle cx="${wx + 16 + i * 15}" cy="${wy + 14}" r="4.5" fill="${c}"/>`;
  s += text("tplay clip.mp4 --dots", { x: wx + ww / 2, y: wy + 18, font: "mono", size: 12, fill: t.ink3, anchor: "middle" }).svg;

  const cols = 64, rows = 8, frames = 8, every = 2.4;
  const fr = brailleFrames({ cols, rows, frames });
  const gx = wx + 16, gy = wy + 34, gw = ww - 32, rh = 14.5;
  for (const [i, lines] of fr.entries()) {
    s += `<g class="bf bf${i}" style="animation-delay:${(-every + (i * every) / frames).toFixed(3)}s">`;
    for (const [r, line] of lines.entries()) {
      const color = r < 4 ? t.ink : t.ink2;
      s += `<text x="${gx}" y="${gy + r * rh + rh / 2}" textLength="${gw}" lengthAdjust="spacingAndGlyphs" fill="${color}">${esc(line)}</text>`;
    }
    s += `</g>`;
  }
  // the player's bar: play, a scrubber, the time, and the picture modes
  const by = wy + wh - 22;
  s += `<path d="M${gx} ${by - 5}l9 5l-9 5z" fill="${t.ink}"/>`;
  const tx0 = gx + 22, tw = 140;
  s += `<rect x="${tx0}" y="${by - 1.5}" width="${tw}" height="3" rx="1.5" fill="${t.line}"/><rect class="scrub" x="${tx0}" y="${by - 1.5}" width="${tw}" height="3" rx="1.5" fill="${t.blue}"/>`;
  s += text("0:12 / 1:04", { x: tx0 + tw + 12, y: by + 4.5, font: "mono", size: 12, fill: t.ink3 }).svg;
  let mx = gx + gw;
  for (const m of ["ascii", "braille", "half"]) {
    const w = measure(m, { font: "mono", size: 12 });
    mx -= w;
    if (m === "braille") s += `<rect x="${mx - 6}" y="${by - 10}" width="${w + 12}" height="20" rx="5" fill="${t.blueSoft}"/>`;
    s += text(m, { x: mx, y: by + 4.5, font: "mono", size: 12, fill: m === "braille" ? t.blue : t.ink3 }).svg;
    mx -= 18;
  }
  const style =
    `text{font-family:${FACES};font-size:13px;white-space:pre;dominant-baseline:central}` +
    `.bf{opacity:0;animation:bf ${every}s step-end infinite}.bf0{opacity:1}@keyframes bf{0%{opacity:1}${(100 / frames).toFixed(3)}%,100%{opacity:0}}` +
    `.scrub{transform-box:fill-box;transform-origin:left;animation:scrub 12s linear infinite}@keyframes scrub{0%{transform:scaleX(.08)}100%{transform:scaleX(1)}}`;
  return { svg: s, style };
}

// ---------------------------------------------------------------- packets
// the client's side of it: a server's traffic arriving decoded, one line a
// packet, with the names it could read off the wire (DNS questions, TLS SNI)
function packetsVisual(t, box) {
  let s = "";
  const x0 = box.x + 20, x1 = box.x + box.w - 20;
  s += text("$", { x: x0, y: box.y + 30, font: "mono", size: 13, fill: t.ink3 }).svg;
  s += text("pktsniff-client 203.0.113.10 -F 'tls or dns' -w out.pcap", { x: x0 + 16, y: box.y + 30, font: "mono", size: 13, fill: t.ink2 }).svg;
  s += `<circle class="rec" cx="${x1 - 5}" cy="${box.y + 25.5}" r="4.5" fill="${t.blue}"/>`;
  s += `<path d="M${x0} ${box.y + 46}H${x1}" stroke="${t.line}"/>`;
  // label, addresses, then what the dissector made of the payload; the name
  // in it is the part worth reading, so that is what the accent marks
  const me = "10.0.0.5", dns = "1.1.1.1:53";
  const ask = (port, q) => ["UDP", `${me}:${port} -> ${dns}`, `DNS ${q.split(" ")[0]} `, q.split(" ")[1]];
  const answer = (port, q) => ["UDP", `${dns} -> ${me}:${port}`, `DNS(r) ${q.split(" ")[0]} `, q.split(" ")[1]];
  const hello = (port, ip, name) => ["TCP", `${me}:${port} -> ${ip}:443`, "TLS SNI=", name];
  const shake = (port, ip) => ["TCP", `${ip}:443 -> ${me}:${port}`, "TLS handshake", ""];
  const rows = [
    ask(40233, "A github.com"),
    answer(40233, "A github.com"),
    hello(53112, "140.82.112.3", "github.com"),
    shake(53112, "140.82.112.3"),
    ask(51907, "AAAA ascii.rest"),
    answer(51907, "AAAA ascii.rest"),
    hello(41870, "104.21.48.7", "ascii.rest"),
    shake(41870, "104.21.48.7"),
    ask(38114, "A api.github.com"),
    hello(36402, "140.82.113.6", "api.github.com"),
    ask(47021, "HTTPS cloudflare.com"),
    hello(44790, "1.1.1.1", "one.one.one.one"),
  ];
  const n = 7, lh = 24, size = 12;
  const adv = measure("0", { font: "mono", size });
  const gy = box.y + 54;
  // real <text> in the reader's monospace face, not outlines: two dozen
  // lines of packets as paths would weigh a few hundred kilobytes. Every
  // run is pinned to Geist Mono's width, so the columns hold in any face
  const run = (str, col, y, fill, inner = esc(str)) =>
    `<text x="${r1(x0 + adv * col)}" y="${y}" fill="${fill}" textLength="${r1(adv * str.length)}" lengthAdjust="spacingAndGlyphs">${inner}</text>`;
  const line = ([proto, addr, app, name], y) =>
    run(proto, 0, y, t.ink) +
    run(addr, 5, y, t.ink2) +
    run(app + name, 41, y, t.ink2, esc(app) + (name ? `<tspan fill="${t.blue}">${esc(name)}</tspan>` : ""));
  let g = "";
  // twice over, so the loop's last step lands on a window like its first
  [...rows, ...rows].forEach((row, i) => (g += line(row, gy + 16 + i * lh)));
  s += `<defs><clipPath id="pk"><rect x="${box.x}" y="${gy}" width="${box.w}" height="${n * lh}"/></clipPath></defs>`;
  s += `<g clip-path="url(#pk)" class="pkt"><g class="pk">${g}</g></g>`;
  s += text("who the box is talking to, and a .pcap to prove it", { x: x0, y: box.y + box.h - 8, size: 14, fill: t.ink3 }).svg;
  const style =
    `.pkt text{font-family:${FACES};font-size:${size}px;white-space:pre}` +
    `.rec{animation:rec 1.2s steps(1) infinite}@keyframes rec{50%{opacity:.2}}` +
    `.pk{animation:pk ${r1(rows.length * 0.9)}s steps(${rows.length}) infinite}@keyframes pk{to{transform:translateY(-${rows.length * lh}px)}}`;
  return { svg: s, style };
}

// ---------------------------------------------------------------- honeypot
// who knocked on :2222 tonight, and what they tried
function honeypotVisual(t, box) {
  let s = "";
  const x0 = box.x + 20, x1 = box.x + box.w - 20;
  s += text("listening on :2222", { x: x0, y: box.y + 30, font: "mono", size: 13.5, fill: t.ink2 }).svg;
  s += text("every attempt logged", { x: x1, y: box.y + 30, font: "mono", size: 13.5, fill: t.ink3, anchor: "end" }).svg;
  s += `<path d="M${x0} ${box.y + 46}H${x1}" stroke="${t.line}"/>`;
  const tries = [
    ["03:14:07", "203.0.113.42", "root", "123456"],
    ["03:14:09", "198.51.100.7", "admin", "admin"],
    ["03:14:15", "192.0.2.199", "pi", "raspberry"],
    ["03:14:22", "203.0.113.250", "root", "toor"],
    ["03:14:31", "198.51.100.66", "oracle", "oracle"],
    ["03:14:40", "192.0.2.13", "ubuntu", "ubuntu"],
  ];
  tries.forEach(([time, ip, user, pass], i) => {
    const y = box.y + 76 + i * 29;
    let r = text(time, { x: x0, y, font: "mono", size: 13, fill: t.ink3 }).svg;
    r += text(ip, { x: x0 + 82, y, font: "mono", size: 13, fill: t.ink2 }).svg;
    r += text(`${user} / ${pass}`, { x: x0 + 216, y, font: "mono", size: 13, fill: t.ink }).svg;
    r += text("let in", { x: x1, y, font: "mono", size: 13, fill: t.blue, anchor: "end" }).svg;
    s += `<g class="try try${i}">${r}</g>`;
  });
  // all there at first sight; then the night starts over, one knock at a time
  const style =
    `.try{animation:10s linear infinite}` +
    tries.map((_, i) => `.try${i}{animation-name:try${i}}@keyframes try${i}{0%,60%{opacity:1}62%,${64 + i * 5}%{opacity:0}${65 + i * 5}%,100%{opacity:1}}`).join("");
  return { svg: s, style };
}

// ---------------------------------------------------------------- ultrabalancer
// requests come in on the left and go round the four backends in turn
function ultrabalancerVisual(t, box) {
  let s = "";
  const cy = box.y + box.h / 2 - 12;
  const inX = box.x + 46, lbX = box.x + 200, beX = box.x + 352;
  const backs = [0, 1, 2, 3].map((k) => ({ y: cy - 84 + k * 56, name: `10.0.1.${10 + k}:8080` }));
  s += `<circle cx="${inX}" cy="${cy}" r="22" fill="${t.card}" stroke="${t.line}"/>`;
  s += text(":443", { x: inX, y: cy + 4.5, font: "mono", size: 12.5, fill: t.ink2, anchor: "middle" }).svg;
  s += `<path d="M${inX + 22} ${cy}H${lbX - 58}" stroke="${t.line}"/>`;
  s += `<rect x="${lbX - 58}" y="${cy - 22}" width="116" height="44" rx="8" fill="${t.blueSoft}" stroke="${t.blue}"/>`;
  s += text("round-robin", { x: lbX, y: cy + 4.5, font: "mono", size: 12.5, fill: t.blue, anchor: "middle" }).svg;
  let dots = "";
  backs.forEach((b, k) => {
    const d = `M${lbX + 58} ${cy}C${lbX + 100} ${cy} ${beX - 50} ${b.y} ${beX - 8} ${b.y}`;
    s += `<path d="${d}" stroke="${t.line}"/>`;
    s += `<rect x="${beX - 8}" y="${b.y - 15}" width="166" height="30" rx="6" fill="${t.card}" stroke="${t.line}"/>`;
    s += `<circle cx="${beX + 6}" cy="${b.y}" r="3.5" fill="${t.ink2}"/>`;
    s += text(b.name, { x: beX + 18, y: b.y + 4.5, font: "mono", size: 12.5, fill: t.ink2 }).svg;
    const path = `M${inX + 22} ${cy}H${lbX + 58}C${lbX + 100} ${cy} ${beX - 50} ${b.y} ${beX - 8} ${b.y}`;
    dots += `<circle r="3.5" fill="${t.ink}" opacity="0"><animateMotion path="${path}" dur="1.2s" begin="${k * 0.6}s;dot${k}.end+1.2s" id="dot${k}" fill="remove"/><set attributeName="opacity" to="1" begin="dot${k}.begin" end="dot${k}.end"/></circle>`;
  });
  s += `<g class="motion">${dots}</g>`;
  s += text("~850k requests a second on an M4 Pro", { x: box.x + 20, y: box.y + box.h - 8, size: 14, fill: t.ink3 }).svg;
  return { svg: s };
}

// ---------------------------------------------------------------- stars
// ascii's star count from GitHub at build time, rounded down so the chip
// stays true as it grows: 1,135 is "1.1k"
async function stars(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: { "user-agent": "bas3line-readme" } });
  if (!res.ok) throw new Error(`GitHub said ${res.status} for ${repo}'s star count`);
  const n = (await res.json()).stargazers_count;
  return n >= 1000 ? `${Math.floor(n / 100) / 10}k` : String(n);
}

// the slot a recorded clip fills in a card: the panel's inner edge, 1px in
export const SLOT = { x: 43, y: 225, w: W - 86, h: H - 268, r: 7 };
const empty = () => ({ svg: "" });

const TS = { text: "TypeScript", logo: "typescript" };

const C = { text: "C", logo: "c" };
const RUST = { text: "Rust", logo: "rust" };

export const CARDS = {
  "card-ascii": async (t) =>
    card(t, {
      n: "01",
      title: "ascii",
      desc: "Animated ascii art for web pages, in TypeScript: React, Next.js, Astro, or one HTML tag.",
      tags: [TS, { text: `${await stars("bas3line/ascii")} stars`, star: true }, "240 pieces", "ascii.rest"],
      label: "ascii: animated ascii art for web pages, with a spinning ascii donut",
      visual: asciiVisual,
    }),
  "card-airsec": (t) =>
    card(t, {
      n: "02",
      title: "airsec",
      desc: "Security review driven by the coding CLI you already have. No new API key, no cloud upload.",
      tags: [TS, { text: "Node 20+", logo: "nodejs" }, "npx airsec"],
      label: "airsec: security review driven by your coding CLI",
      visual: airsecVisual,
    }),
  "card-gopher": (t) =>
    card(t, {
      n: "03",
      title: "Gopher",
      desc: "An AI Discord bot with long-term memory, web research, vision and voice replies.",
      tags: [TS, { text: "Bun", logo: "bun" }, { text: "pgvector", logo: "postgresql" }],
      label: "Gopher: an AI Discord bot that remembers",
      visual: gopherVisual,
    }),
  "card-packets": (t) =>
    card(t, {
      n: "04",
      title: "packets",
      desc: "A remote packet sniffer: capture on a server, read it decoded on your laptop, keep the .pcap for Wireshark.",
      tags: [C, "raw sockets", "kernel BPF", ".pcap + JSON"],
      label: "packets: a remote packet sniffer, here naming a server's DNS lookups and TLS connections as they happen",
      visual: packetsVisual,
    }),
  "card-honeypot": (t) =>
    card(t, {
      n: "05",
      title: "honeypot",
      desc: "An SSH server that lets attackers in to a shell that isn't real, and logs every password and command.",
      tags: [RUST, { text: "Docker", logo: "docker" }, "JSON logs"],
      label: "honeypot: an SSH honeypot logging login attempts",
      visual: honeypotVisual,
    }),
  "card-ultrabalancer": async (t) =>
    card(t, {
      n: "06",
      title: "ultrabalancer",
      desc: "A load balancer in Rust, built for the day connection counts stop being friendly.",
      tags: [RUST, { text: `${await stars("bas3line/ultrabalancer")} stars`, star: true }, "ultrabalancer.com"],
      label: "ultrabalancer: a Rust load balancer sending requests round-robin to four backends",
      visual: ultrabalancerVisual,
    }),
  "card-tplay": (t) =>
    card(t, {
      n: "07",
      title: "tplay",
      desc: "Play videos in your terminal, with sound: half-block colour, dithered braille dots, or ascii.",
      tags: [RUST, { text: "ffmpeg", logo: "ffmpeg" }, "3 picture modes"],
      label: "tplay: video in the terminal, drawn in braille dots",
      visual: tplayVisual,
    }),
};

// cards whose panel holds a recorded clip: media.mjs draws these frames and
// films the clip into SLOT
export const CLIP_CARDS = {};
