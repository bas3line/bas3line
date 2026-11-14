// A server rack at 3:14 a.m. with the power out: patch panel, switch, four GPU
// servers, a storage shelf, a blank, and the UPS saying it's on battery. Drawn
// as rows of ascii with a class per character, and the LEDs kept apart so they
// can be lit and blink.
const IW = 50; // between the rails

// each character's class: f frame, v vent, p part, w warning
function unit(text, classes) {
  const t = text.padEnd(IW).slice(0, IW);
  const leds = [];
  let s = "";
  let m = "";
  for (let i = 0; i < IW; i++) {
    const c = t[i];
    if ("*+!".includes(c)) {
      leds.push({ col: i, kind: c === "*" ? "act" : c === "+" ? "pwr" : "warn" });
      s += " ";
      m += " ";
    } else {
      s += c;
      m += c === " " ? " " : classes(c, i);
    }
  }
  return { s, m, leds };
}

export function rack() {
  const rows = [];
  const leds = [];
  const put = (u, rail = " ") => {
    u.leds.forEach((l) => leds.push({ row: rows.length, col: l.col + 3, kind: l.kind }));
    rows.push({ s: `|${rail}|${u.s}|${rail}|`, m: `fff${u.m}fff` });
  };
  const frame = () => "f";
  const sep = (ch = "-") => put(unit(ch.repeat(IW), frame), "o");
  const parts = (c) => ("[]=:".includes(c) ? "p" : "v");

  sep("=");
  put(unit(" " + "[:] ".repeat(12), parts));
  sep();
  put(unit(" " + "*  ".repeat(16), parts));
  put(unit(" " + "[] ".repeat(16), parts));
  for (let k = 0; k < 4; k++) {
    sep();
    put(unit(" + * " + "|".repeat(27) + "  [==] [==] [==]", parts));
    put(unit("     " + "|".repeat(27) + "  [==] [==] [==]", parts));
  }
  sep();
  put(unit(" " + "[*===] ".repeat(7), parts));
  put(unit(" " + "[*===] ".repeat(7), parts));
  sep();
  put(unit(" " + ". ".repeat(24), () => "v"));
  sep();
  put(unit(" !  ON BATTERY       " + ":".repeat(28), (c, i) => (i < 18 ? "w" : "v")));
  put(unit("    RUNTIME 07:12    " + ":".repeat(28), (c, i) => (i < 18 ? "p" : "v")));
  sep("=");
  rows.push({ s: " /__\\" + " ".repeat(IW - 4) + "/__\\ ", m: " ffff" + " ".repeat(IW - 4) + "ffff " });
  return { rows, leds, cols: IW + 6 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { rows, leds } = rack();
  const g = rows.map((r) => [...r.s]);
  for (const l of leds) g[l.row][l.col] = { act: "*", pwr: "+", warn: "!" }[l.kind];
  console.log(g.map((r) => r.join("")).join("\n"));
}
