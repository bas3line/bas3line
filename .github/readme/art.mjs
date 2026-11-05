// Lewis Morris Rutherfurd's Full Moon (1871, The Met, CC0) as a grid of ascii
// cells: brightness above the night sky picks the character, so the maria
// read as lighter type inside the disc.
// Source: https://www.metmuseum.org/art/collection/search/813902, the left
// moon of the stereo card, cropped square and scaled to 900 pixels.
import { readFileSync } from "node:fs";
import jpeg from "jpeg-js";

export const RAMP = " .'`:-~=+*xo#%@";

export async function moon({ cols = 76, aspect = 0.5 } = {}) {
  const img = jpeg.decode(readFileSync(new URL("./sources/moon.jpg", import.meta.url)), { useTArray: true });
  const W = img.width, H = img.height;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = img.data[i * 4], g = img.data[i * 4 + 1], b = img.data[i * 4 + 2];
    lum[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  // the sky is the card's dark brown; the brightest highlands are near 0.9
  const sorted = Float32Array.from(lum).sort();
  const sky = sorted[Math.floor(sorted.length * 0.2)];
  const peak = sorted[Math.floor(sorted.length * 0.995)];

  const cw = W / cols;
  const ch = cw / aspect;
  const rows = Math.floor(H / ch);
  const tone = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let sum = 0, n = 0;
      for (let y = Math.floor(r * ch); y < Math.floor((r + 1) * ch); y++)
        for (let x = Math.floor(c * cw); x < Math.floor((c + 1) * cw); x++) {
          sum += lum[y * W + x];
          n++;
        }
      let v = (sum / n - sky) / (peak - sky);
      v = v < 0.16 ? 0 : Math.min(1, Math.pow(v, 1.15));
      row.push(v);
    }
    tone.push(row);
  }
  const grid = tone.map((row) => row.map((v) => (v ? RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(v * (RAMP.length - 1))))] : " ")).join(""));
  return { grid, tone, cols, rows };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { grid } = await moon({ cols: Number(process.argv[2] ?? 76) });
  console.log(grid.join("\n"));
}
