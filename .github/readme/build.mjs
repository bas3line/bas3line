// Draws every image the profile README shows, light and dark, into
// assets/readme: npm install && npm run build [-- <name prefix>]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { THEMES } from "./lib.mjs";
import { hero } from "./hero.mjs";
import { CARDS } from "./cards.mjs";
import { button, heading, page, timeline, work } from "./sections.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const out = here("../../assets/readme/");
const only = process.argv[2];
const chipsDir = here("../../assets/chips");
const pages = here("./sources/pages/");
mkdirSync(out, { recursive: true });

const jobs = {
  hero,
  ...CARDS,
  "heading-projects": (t) => heading(t, { eyebrow: "THINGS I'VE MADE", plain: "Agents. Terminals.", accent: "The web." }),
  "heading-pages": (t) => heading(t, { eyebrow: "PAGES I'VE DRAWN", plain: "Landing pages,", accent: "drawn in code." }),
  "heading-work": (t) => heading(t, { eyebrow: "WORK", plain: "I keep production", accent: "boring." }),
  timeline,
  work: (t) => work(t, { chipsDir }),
  "page-nodeny": (t) => page(t, { file: `${pages}nodeny.jpg`, url: "nodeny.kiraa-7e4.workers.dev", name: "nodeny", line: "React, Tailwind, canvas · a Roman marble from The Met" }),
  "page-turtle": (t) => page(t, { file: `${pages}turtle.jpg`, url: "turtle.kiraa-7e4.workers.dev", name: "turtle", line: "React, Tailwind, canvas · Japanese prints from The Met" }),
  "page-absolute": (t) => page(t, { file: `${pages}absolute.jpg`, url: "absolute.kiraa-7e4.workers.dev", name: "absolute", line: "Next.js, Tailwind · drawings in code, a working panel" }),
  "page-ascii": (t) => page(t, { file: `${pages}ascii.jpg`, url: "ascii.rest", name: "ascii.rest", line: "Astro · 240 animated pieces, all in ascii" }),
  "btn-site": (t) => button(t, { label: "yshubham.com", kind: "solid", arrow: true }),
  "btn-call": (t) => button(t, { label: "Book a call", kind: "blue" }),
  "btn-mail": (t) => button(t, { label: "Email" }),
  "btn-x": (t) => button(t, { label: "X" }),
  "btn-linkedin": (t) => button(t, { label: "LinkedIn" }),
};

for (const [name, make] of Object.entries(jobs)) {
  if (only && !name.startsWith(only)) continue;
  for (const [mode, t] of Object.entries(THEMES)) {
    const svg = await make(t);
    const file = join(out, mode === "dark" ? `${name}-dark.svg` : `${name}.svg`);
    writeFileSync(file, svg);
    console.log(file, `${(svg.length / 1024).toFixed(1)} KB`);
  }
}
