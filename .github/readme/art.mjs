// Head of Krishna (Sahib Ram, Jaipur, ca. 1800 · The Met, CC0) as a grid of
// ascii cells: paper washed out, tone + edges mapped to a density ramp.
// Source: https://www.metmuseum.org/art/collection/search/37877, the full
// image scaled to 900 pixels wide.
import { readFileSync } from "node:fs";
import jpeg from "jpeg-js";

export const RAMP = " .'`:-~=+*xo#%@";

export async function krishna({ cols = 72, aspect = 0.5, floor = 0.2, crop = { x: 175, y: 175, w: 665, h: 735 } } = {}) {
  const png = jpeg.decode(readFileSync(new URL("./sources/krishna.jpg", import.meta.url)), { useTArray: true });
  const W = crop.w, H = crop.h;
  const lum = new Float32Array(W * H);
  const sat = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = ((y + crop.y) * png.width + (x + crop.x)) * 4;
      const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
      lum[y * W + x] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      sat[y * W + x] = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
    }
  }
  // the paper is stained and uneven, so judge each pixel against the paper
  // around it: a wide blur of the brightest nearby tone stands in for it
  const paperL = blurMax(lum, W, H, 48);
  const dark = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    let d = Math.max(0, paperL[i] - lum[i]) / Math.max(0.2, paperL[i]);
    d = Math.max(0, (d - 0.06) / 0.94);
    // colour (turban, jewels) reads as tone even when it is light; the
    // paper itself sits near 0.22 saturation, the turban near 0.37
    const s = Math.max(0, sat[i] - 0.25) * 2.1;
    dark[i] = Math.min(1, d * 1.35 + s);
  }
  const cw = W / cols;
  const ch = cw / aspect;
  const rows = Math.floor(H / ch);
  const grid = [];
  const tone = [];
  for (let r = 0; r < rows; r++) {
    const t = [];
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cw), x1 = Math.floor((c + 1) * cw);
      const y0 = Math.floor(r * ch), y1 = Math.floor((r + 1) * ch);
      let sum = 0, n = 0, mx = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const v = dark[y * W + x];
        sum += v; n++; if (v > mx) mx = v;
      }
      const mean = sum / n;
      // a thin dark line inside a cell should still show: blend in the max
      let v = Math.min(1, mean * 0.8 + mx * 0.4);
      v = v < floor ? 0 : Math.pow(v, 0.85);
      t.push(v);
    }
    tone.push(t);
  }
  // drop specks: a lit cell with fewer than two lit neighbours is paper grain
  const lit = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && tone[r][c] > 0;
  const clean = tone.map((row, r) =>
    row.map((v, c) => {
      if (!v) return 0;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if ((dr || dc) && lit(r + dr, c + dc)) n++;
      return n >= 2 ? v : 0;
    }),
  );
  for (const row of clean) {
    grid.push(row.map((v) => (v ? RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(v * (RAMP.length - 1))))] : " ")).join(""));
  }
  return { grid, tone: clean, cols, rows };
}

// separable box blur
function blur(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    let acc = 0, n = 0;
    for (let x = -r; x < W; x++) {
      if (x + r < W) { acc += src[y * W + x + r]; n++; }
      if (x - r - 1 >= 0) { acc -= src[y * W + x - r - 1]; n--; }
      if (x >= 0) tmp[y * W + x] = acc / n;
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0, n = 0;
    for (let y = -r; y < H; y++) {
      if (y + r < H) { acc += tmp[(y + r) * W + x]; n++; }
      if (y - r - 1 >= 0) { acc -= tmp[(y - r - 1) * W + x]; n--; }
      if (y >= 0) out[y * W + x] = acc / n;
    }
  }
  return out;
}

// paper estimate: the brightest tone within r pixels (a max filter, so a big
// black area still finds the paper around it), smoothed so stains fade in
function blurMax(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let m = 0;
      for (let k = Math.max(0, x - r); k <= Math.min(W - 1, x + r); k += 2) m = Math.max(m, src[y * W + k]);
      tmp[y * W + x] = m;
    }
  for (let x = 0; x < W; x++)
    for (let y = 0; y < H; y++) {
      let m = 0;
      for (let k = Math.max(0, y - r); k <= Math.min(H - 1, y + r); k += 2) m = Math.max(m, tmp[k * W + x]);
      out[y * W + x] = m;
    }
  return blur(out, W, H, Math.round(r / 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { grid } = await krishna({ cols: Number(process.argv[2] ?? 96) });
  console.log(grid.join("\n"));
}
