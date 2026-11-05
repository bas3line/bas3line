// Films the cards that hold something live: each landing page, the
// Components preview, and agent office's own demo. A card's frame is drawn
// as an SVG, the live page (in an iframe) or the demo (a <video>) sits in its
// slot, and headless Chrome is screenshotted over the DevTools protocol;
// img2webp (libwebp) makes the frames an animated WebP, light and dark.
//
//   npm run media [-- <name prefix>]
//
// Needs Google Chrome, img2webp on PATH, and the network for the live pages.
// agent office's clip is read from sources/agent-office-demo.mp4 (the repo's
// docs/demo.mp4); fetch it first with `npm run fetch-demo`.
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { THEMES } from "./lib.mjs";
import { CLIP_CARDS, SLOT } from "./cards.mjs";
import { page, PAGE_SLOT } from "./sections.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const out = here("../../assets/readme/");
const cache = here("./.cache/");
const only = process.argv[2];
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DPR = 1.5;

// what plays in each slot
const CLIPS = {
  "card-agent-office": {
    ...CLIP_CARDS["card-agent-office"],
    size: [600, 520],
    slot: SLOT,
    // the demo zooms in on api-gateway as Claude Code flips its table
    video: { src: here("./sources/agent-office-demo.mp4"), w: 1200, h: 750, crop: { x: 20, y: 18, w: 1040, h: 510 }, from: 17.6, to: 19.9, fps: 15 },
  },
  "card-components": {
    ...CLIP_CARDS["card-components"],
    size: [600, 520],
    slot: SLOT,
    live: { url: "https://bas3line.github.io/Components/preview/server-island/", w: 1200, h: Math.round((1200 * SLOT.h) / SLOT.w), seconds: 5, fps: 10, settle: 4000 },
  },
  ...Object.fromEntries(
    [
      ["nodeny", "https://nodeny.kiraa-7e4.workers.dev", "nodeny", "React, Tailwind, canvas · a Roman marble from The Met"],
      ["turtle", "https://turtle.kiraa-7e4.workers.dev", "turtle", "React, Tailwind, canvas · Japanese prints from The Met"],
      ["absolute", "https://absolute.kiraa-7e4.workers.dev", "absolute", "Next.js, Tailwind · drawings in code, a working panel"],
      ["ascii", "https://ascii.rest", "ascii.rest", "Astro · 240 animated pieces, all in ascii"],
    ].map(([key, url, name, line]) => [
      `page-${key}`,
      {
        frame: (t) => page(t, { url: new URL(url).host, name, line }),
        alt: `${name}'s landing page, live`,
        size: [600, 7 + 46 + PAGE_SLOT.h + 86 + 7],
        slot: PAGE_SLOT,
        // ascii.rest redraws its whole scene every frame, so it gets fewer, lighter ones
        live: key === "ascii" ? { url, w: 1440, h: 900, seconds: 4, fps: 8, settle: 5000, q: 55 } : { url, w: 1440, h: 900, seconds: 5, fps: 10, settle: 5000 },
      },
    ]),
  ),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chrome() {
  const port = 9400 + Math.floor(Math.random() * 400);
  const proc = spawn(CHROME, ["--headless=new", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--allow-file-access-from-files", `--remote-debugging-port=${port}`, `--user-data-dir=${join(cache, "chrome")}`, "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    try {
      await fetch(`http://127.0.0.1:${port}/json/version`);
      return { port, proc };
    } catch {}
  }
  throw new Error("Chrome did not start");
}

async function tab(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener("open", r, { once: true }); ws.addEventListener("error", j, { once: true }); });
  let id = 0;
  const pending = new Map();
  const waiters = [];
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    } else if (m.method) for (const w of waiters.splice(0)) w(m);
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const event = (name) => new Promise((r) => { const f = (m) => (m.method === name ? r(m) : waiters.push(f)); waiters.push(f); });
  return { send, event, close: () => fetch(`http://127.0.0.1:${port}/json/close/${t.id}`) };
}

function html(clip, t) {
  const [W, H] = clip.size;
  const s = clip.slot;
  const frame = Buffer.from(clip.frame(t)).toString("base64");
  let media = "";
  if (clip.live) {
    const k = s.w / clip.live.w;
    media = `<iframe src="${clip.live.url}" scrolling="no" style="position:absolute;left:0;top:0;width:${clip.live.w}px;height:${clip.live.h}px;border:0;transform:scale(${k});transform-origin:0 0"></iframe>`;
  } else {
    const v = clip.video;
    const k = s.w / v.crop.w;
    media = `<video id="v" src="file://${v.src}" muted playsinline preload="auto" style="position:absolute;left:${-v.crop.x * k}px;top:${-v.crop.y * k}px;width:${v.w * k}px;height:${v.h * k}px"></video>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:${t.bg};overflow:hidden}</style></head><body>
<div style="position:relative;width:${W}px;height:${H}px">
<img src="data:image/svg+xml;base64,${frame}" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">
<div style="position:absolute;left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px;border-radius:${s.r}px;overflow:hidden;background:${t.tint}">${media}</div>
<div style="position:absolute;left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px;border-radius:${s.r}px;box-shadow:inset 0 0 0 1px ${t.line};pointer-events:none"></div>
</div>
<script>
const v = document.getElementById("v");
window.ready = v ? new Promise((r) => (v.readyState >= 2 ? r() : v.addEventListener("loadeddata", r, { once: true }))) : Promise.resolve();
window.seek = (s) => new Promise((r) => { v.addEventListener("seeked", () => requestAnimationFrame(() => requestAnimationFrame(r)), { once: true }); v.currentTime = s; });
</script></body></html>`;
}

async function film(port, name, clip, mode, t) {
  const [W, H] = clip.size;
  const dir = join(cache, `${name}-${mode}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "card.html");
  writeFileSync(file, html(clip, t));

  const p = await tab(port);
  await p.send("Page.enable");
  await p.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: false });
  const loaded = p.event("Page.loadEventFired");
  await p.send("Page.navigate", { url: `file://${file}` });
  await loaded;
  await p.send("Runtime.evaluate", { expression: "window.ready", awaitPromise: true });
  const shot = async () => Buffer.from((await p.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })).data, "base64");

  const frames = [];
  if (clip.video) {
    // seek frame by frame: every frame lands exactly, whatever the machine
    const v = clip.video;
    const n = Math.round((v.to - v.from) * v.fps);
    for (let i = 0; i < n; i++) {
      await p.send("Runtime.evaluate", { expression: `seek(${(v.from + i / v.fps).toFixed(3)})`, awaitPromise: true });
      frames.push({ png: await shot(), ms: Math.round(1000 / v.fps) });
    }
  } else {
    // a live page runs on its own clock: let it settle, then take what comes
    const l = clip.live;
    await sleep(l.settle);
    const step = 1000 / l.fps;
    const t0 = Date.now();
    let next = t0;
    while (Date.now() - t0 < l.seconds * 1000) {
      const at = Date.now();
      frames.push({ png: await shot(), at });
      next += step;
      await sleep(Math.max(0, next - Date.now()));
    }
    frames.forEach((f, i) => (f.ms = i + 1 < frames.length ? frames[i + 1].at - f.at : Math.round(step)));
  }
  await p.close();

  const args = ["-loop", "0", "-lossy", "-q", String((clip.live ?? clip.video).q ?? 72), "-m", "4"];
  frames.forEach((f, i) => {
    const png = join(dir, `${String(i).padStart(3, "0")}.png`);
    writeFileSync(png, f.png);
    args.push("-d", String(Math.max(20, f.ms)), png);
  });
  const dest = join(out, mode === "dark" ? `${name}-dark.webp` : `${name}.webp`);
  execFileSync("img2webp", [...args, "-o", dest], { stdio: "ignore" });
  console.log(dest, `${frames.length} frames`, `${(statSync(dest).size / 1024).toFixed(0)} KB`);
}

mkdirSync(cache, { recursive: true });
const { port, proc } = await chrome();
try {
  for (const [name, clip] of Object.entries(CLIPS)) {
    if (only && !name.startsWith(only)) continue;
    if (clip.video && !existsSync(clip.video.src)) throw new Error(`${clip.video.src} is missing: npm run fetch-demo`);
    for (const [mode, t] of Object.entries(THEMES)) await film(port, name, clip, mode, t);
  }
} finally {
  proc.kill();
}
