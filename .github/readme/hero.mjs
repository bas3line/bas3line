// The hero: headline on the left, and on the right a server rack in ascii at
// 3:14 a.m., the power out, still serving.
import { doc, panel, paragraph, text, measure, esc } from "./lib.mjs";
import { rack } from "./art.mjs";

const W = 1280;
const H = 780;
const LINES = ["Fast servers.", "Pretty pages."];

export async function hero(t) {
  const art = rack();
  let b = "";

  // left column
  const lx = 92;
  const eyebrow = text("Software engineer at Command Code.", { x: lx, y: 150, size: 18, fill: t.ink3 });
  b += eyebrow.svg;
  const link = text("yshubham.com →", { x: lx + eyebrow.width + 7, y: 150, size: 18, fill: t.ink });
  b += link.svg + `<path d="M${link.x} 156.5H${link.x + link.width}" stroke="${t.ink}" stroke-width="1"/>`;

  // headline, sized to the column
  const maxW = 560;
  let size = 96;
  while (Math.max(...LINES.map((l) => measure(l, { font: "medium", size, tracking: -0.045 }))) > maxW) size -= 1;
  const lh = size * 1.02;
  b += text(LINES[0], { x: lx - 3, y: 186 + size * 0.92, font: "medium", size, tracking: -0.045, fill: t.ink }).svg;
  b += text(LINES[1], { x: lx - 3, y: 186 + size * 0.92 + lh, font: "medium", size, tracking: -0.045, fill: t.blue }).svg;

  const by = 186 + size * 0.92 + lh + 66;
  b += paragraph(
    "I'm Shubham, a systems engineer from Jaipur. I keep inference running at Command Code, and on the side I make tools for coding agents, terminals and the web.",
    { x: lx, y: by, max: 520, lineHeight: 33, size: 21, fill: t.ink2 },
  );

  // turtle's input box, holding a command that really runs
  const iy = by + 3 * 33 + 30;
  const iw = 470, ih = 58;
  b += `<rect x="${lx}" y="${iy}" width="${iw}" height="${ih}" rx="12" fill="${t.card}" stroke="${t.line}"/>`;
  b += `<rect x="${lx - 5}" y="${iy - 5}" width="${iw + 10}" height="${ih + 10}" rx="16" stroke="${t.blueSoft}" stroke-width="4" fill="none"/>`;
  b += text("$", { x: lx + 20, y: iy + 36, font: "mono", size: 18, fill: t.ink3 }).svg;
  b += text("npx ascii.rest donut", { x: lx + 42, y: iy + 36, font: "mono", size: 18, fill: t.ink }).svg;
  const bx = lx + iw - 50, byy = iy + 10;
  b += `<rect x="${bx}" y="${byy}" width="38" height="38" rx="9" fill="${t.blue}"/>`;
  b += `<path d="M${bx + 11} ${byy + 19}H${bx + 27}M${bx + 20} ${byy + 12}L${bx + 27} ${byy + 19}L${bx + 20} ${byy + 26}" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  // caret blinking after the command
  const cx = lx + 42 + measure("npx ascii.rest donut ", { font: "mono", size: 18 });
  b += `<rect class="caret" x="${cx}" y="${iy + 20}" width="9" height="21" fill="${t.blue}"/>`;

  // right column: the art panel
  const px = 668, py = 72, pw = 532;
  const cols = art.cols, rows = art.rows.length;
  const innerPad = 30;
  const cw = (pw - innerPad * 2) / cols;
  const ch = cw * 2;
  const ph = rows * ch + innerPad * 2;
  b += panel("dots", t, { x: px, y: py, w: pw, h: ph });

  const ax = px + innerPad, ay = py + innerPad;
  const fontSize = (ch * 0.84).toFixed(2);
  const layer = (pred) =>
    art.rows
      .map(({ s: line, m }, r) => {
        let s = "";
        for (let c = 0; c < cols; c++) s += pred(m[c]) ? line[c] : " ";
        if (!s.trim()) return "";
        return `<text x="${ax}" y="${(ay + r * ch + ch / 2).toFixed(1)}" textLength="${(cols * cw).toFixed(1)}" lengthAdjust="spacingAndGlyphs">${esc(s)}</text>`;
      })
      .join("");
  // the frame in ash, vents dim, sleds and ports in bone, the warning in red
  b += `<g class="art" fill="${t.ink3}">${layer((k) => k === "f")}</g>`;
  b += `<g class="art" fill="${t.art[0]}">${layer((k) => k === "v")}</g>`;
  b += `<g class="art" fill="${t.ink2}">${layer((k) => k === "p")}</g>`;
  b += `<g class="art warn" fill="${t.blue}">${layer((k) => k === "w")}</g>`;

  // the LEDs: power steady, activity flickering at its own pace, the UPS
  // pulsing red; each with a soft halo
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let halo = "", dots = "";
  for (const l of art.leds) {
    const x = (ax + (l.col + 0.5) * cw).toFixed(1), y = (ay + l.row * ch + ch / 2).toFixed(1);
    if (l.kind === "pwr") {
      dots += `<circle cx="${x}" cy="${y}" r="2.2" fill="${t.ink2}"/>`;
      continue;
    }
    const st = l.kind === "warn" ? "" : ` style="animation-duration:${(0.25 + rand() * 1.6).toFixed(2)}s;animation-delay:-${(rand() * 2).toFixed(2)}s"`;
    const cls = l.kind === "warn" ? "pulse" : "act";
    halo += `<circle class="${cls}"${st} cx="${x}" cy="${y}" r="6" fill="${t.blue}" opacity=".45"/>`;
    dots += `<circle class="${cls}"${st} cx="${x}" cy="${y}" r="2.6" fill="${t.blue}"/>`;
  }
  b += `<defs><filter id="halo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  b += `<g filter="url(#halo)">${halo}</g>${dots}`;

  // caption, as the landing pages do it
  const capY = py + ph + 30;
  b += text("Rack 7, 3:14 a.m. The power is out.", { x: px, y: capY, font: "mono", size: 14, fill: t.ink3 }).svg;
  b += text("It's still serving.", { x: px, y: capY + 24, font: "mono", size: 14, fill: t.blue }).svg;

  const style =
    `.art text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;font-size:${fontSize}px;white-space:pre;dominant-baseline:central}` +
    `.caret{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}` +
    `.act{animation:act 1s steps(1) infinite}@keyframes act{50%{opacity:.08}}` +
    `.pulse,.warn{animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}`;

  const height = Math.max(H, capY + 76);

  // page frame: two verticals and a rule along the top and bottom, with turtle's dots at the joins
  const fx0 = 40, fx1 = W - 40, fy0 = 30, fy1 = height - 30;
  const dot = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3" fill="${t.bg}" stroke="${t.line}"/>`;
  const frame =
    `<path d="M${fx0} 0V${height}M${fx1} 0V${height}M0 ${fy0}H${W}M0 ${fy1}H${W}" stroke="${t.line}"/>` +
    dot(fx0, fy0) + dot(fx1, fy0) + dot(fx0, fy1) + dot(fx1, fy1);

  return doc({
    w: W,
    h: height,
    t,
    label: "Fast servers. Pretty pages. Shubham, a systems engineer from Jaipur, beside a server rack drawn in ascii at 3:14 a.m.: the power is out, the UPS is on battery, and it is still serving.",
    style,
    body: frame + b,
  });
}
