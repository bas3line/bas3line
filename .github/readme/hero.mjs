// The hero: headline on the left, Sahib Ram's Head of Krishna in ascii on the right.
import { doc, panel, paragraph, text, measure, esc } from "./lib.mjs";
import { krishna } from "./art.mjs";

const W = 1280;
const H = 780;

export async function hero(t) {
  const art = await krishna({ cols: 76 });
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
  while (Math.max(measure("Boring servers.", { font: "medium", size, tracking: -0.045 }), measure("Pretty pages.", { font: "medium", size, tracking: -0.045 })) > maxW) size -= 1;
  const lh = size * 1.02;
  b += text("Boring servers.", { x: lx - 3, y: 186 + size * 0.92, font: "medium", size, tracking: -0.045, fill: t.ink }).svg;
  b += text("Pretty pages.", { x: lx - 3, y: 186 + size * 0.92 + lh, font: "medium", size, tracking: -0.045, fill: t.blue }).svg;

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
  const cols = art.cols, rows = art.rows;
  const innerPad = 30;
  const cw = (pw - innerPad * 2) / cols;
  const ch = cw * 2;
  const ph = rows * ch + innerPad * 2;
  b += panel("dots", t, { x: px, y: py, w: pw, h: ph });

  const ax = px + innerPad, ay = py + innerPad;
  const fontSize = (ch * 0.84).toFixed(2);
  const layer = (pred) =>
    art.grid
      .map((row, r) => {
        let s = "";
        for (let c = 0; c < cols; c++) s += pred(art.tone[r][c]) ? row[c] : " ";
        if (!s.trim()) return "";
        return `<text x="${ax}" y="${(ay + r * ch + ch / 2).toFixed(1)}" textLength="${(cols * cw).toFixed(1)}" lengthAdjust="spacingAndGlyphs">${esc(s)}</text>`;
      })
      .join("");
  const lo = (v) => v > 0 && v < 0.32, mid = (v) => v >= 0.32 && v < 0.58, hi = (v) => v >= 0.58;
  b += `<g class="art" fill="${t.art[0]}">${layer(lo)}</g>`;
  b += `<g class="art" fill="${t.art[1]}">${layer(mid)}</g>`;
  b += `<g class="art" fill="${t.art[2]}">${layer(hi)}</g>`;

  // a glint sweeps across now and then: the same characters, darker, through a moving band
  b += `<defs><clipPath id="band"><rect x="${ax - 260}" y="${ay - 40}" width="90" height="${rows * ch + 80}" transform="skewX(-18)"><animate attributeName="x" values="${ax - 400};${ax - 400};${ax + cols * cw + 300}" keyTimes="0;0.55;1" dur="7s" repeatCount="indefinite"/></rect></clipPath></defs>`;
  b += `<g class="art motion" fill="${t.glint}" clip-path="url(#band)">${layer((v) => v > 0)}</g>`;

  // caption, as the landing pages do it
  const capY = py + ph + 30;
  b += text("Sahib Ram, Head of Krishna, Jaipur, ca. 1800 · The Met, CC0", { x: px, y: capY, font: "mono", size: 14, fill: t.ink3 }).svg;
  b += text("Painted in Jaipur. Redrawn in ascii, from Jaipur.", { x: px, y: capY + 24, font: "mono", size: 14, fill: t.blue }).svg;

  const style =
    `.art text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;font-size:${fontSize}px;white-space:pre;dominant-baseline:central}` +
    `.caret{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`;

  const height = Math.max(H, capY + 76);

  // page frame: two verticals and a rule along the bottom, with turtle's dots at the joins
  const fx0 = 40, fx1 = W - 40, fy = height - 30;
  const frame =
    `<path d="M${fx0} 0V${height}M${fx1} 0V${height}M0 ${fy}H${W}" stroke="${t.line}"/>` +
    `<circle cx="${fx0}" cy="${fy}" r="3" fill="${t.bg}" stroke="${t.line}"/><circle cx="${fx1}" cy="${fy}" r="3" fill="${t.bg}" stroke="${t.line}"/>`;

  return doc({
    w: W,
    h: height,
    t,
    label: "Boring servers. Pretty pages. Shubham, a systems engineer from Jaipur, beside Sahib Ram's Head of Krishna drawn in ascii.",
    style,
    body: frame + b,
  });
}
