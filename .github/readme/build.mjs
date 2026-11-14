// Draws every image the profile README shows into
// assets/readme: npm install && npm run build [-- <name prefix>]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { T } from "./lib.mjs";
import { hero } from "./hero.mjs";
import { CARDS } from "./cards.mjs";
import { button, heading, timeline, work } from "./sections.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const out = here("../../assets/readme/");
const only = process.argv[2];
const chipsDir = here("../../assets/chips");
mkdirSync(out, { recursive: true });

const jobs = {
  hero,
  ...CARDS,
  "heading-projects": (t) => heading(t, { eyebrow: "THINGS I'VE MADE", plain: "Some of them", accent: "watch back." }),
  "heading-pages": (t) => heading(t, { eyebrow: "PAGES I'VE DRAWN", plain: "Landing pages,", accent: "drawn after dark." }),
  "heading-work": (t) => heading(t, { eyebrow: "WORK", plain: "Places I've had", accent: "root." }),
  timeline,
  work: (t) => work(t, { chipsDir }),
  "btn-site": (t) => button(t, { label: "yshubham.com", icon: "yshubham", kind: "solid", arrow: true }),
  "btn-call": (t) => button(t, { label: "Book a call", icon: "calendar", kind: "blue" }),
  "btn-mail": (t) => button(t, { label: "Email", icon: "mail" }),
  "btn-x": (t) => button(t, { icon: "x", alt: "X" }),
  "btn-linkedin": (t) => button(t, { icon: "linkedin", alt: "LinkedIn" }),
};

for (const [name, make] of Object.entries(jobs)) {
  if (only && !name.startsWith(only)) continue;
  const svg = await make(T);
  const file = join(out, `${name}.svg`);
  writeFileSync(file, svg);
  console.log(file, `${(svg.length / 1024).toFixed(1)} KB`);
}
