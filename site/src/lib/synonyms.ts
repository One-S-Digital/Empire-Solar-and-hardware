/**
 * What people say at the counter (Website Plan 6.5, SEO plan 4.5). Each row: phrases a customer might type,
 * and what the catalogue calls it. A matching phrase is swapped for the catalogue's words and searched too.
 * Afrikaans terms are included because Brits shops in English and Afrikaans.
 */
const SYNONYMS: [phrases: string[], means: string][] = [
  [["geezer", "geyzer", "geiser", "geysers", "geezers"], "geyser"],
  [["trip switch", "trip switches", "breaker", "breakers", "mcb", "trip"], "circuit breaker"],
  [["earth leakage", "earth leak", "elcb", "rcd"], "earth leakage circuit breaker"],
  [["db board", "db boards", "db box", "distribution board", "dist board"], "enclosure"],
  [["globe", "globes", "light bulb", "light bulbs", "gloeilamp"], "lamp bulb"],
  [["plug point", "wall plug point", "socket outlet"], "socket"],
  [["rawl plug", "rawl plugs", "wall plug", "wall plugs", "rawlplug"], "anchor"],
  [["jojo", "jojo tank", "water tank"], "tank"],
  [["ballcock", "ball cock"], "float valve"],
  [["stop cock", "shut off valve", "shutoff valve", "isolating valve"], "stopcock"],
  [["torch on", "torch-on"], "waterproofing torch"],
  [["load shedding", "loadshedding", "load shedder", "backup", "back up", "ups", "power backup"], "inverter battery"],
  [["omsetter"], "inverter"],
  [["sonkrag", "solar power", "pv"], "solar"],
  [["silicone", "silicon", "sealant", "caulk"], "weather sealing"],
  [["gutter", "gutters", "downpipe", "downpipes"], "rainwater"],
];

/** Alternative wordings of a query, the original first. Phrases are matched as whole words. */
export function expandQuery(query: string): string[] {
  const q = ` ${query.toLowerCase().replace(/\s+/g, " ").trim()} `;
  const out = new Set<string>([q.trim()]);
  for (const [phrases, means] of SYNONYMS) {
    for (const p of phrases) {
      if (q.includes(` ${p} `)) {
        out.add(q.replace(` ${p} `, ` ${means} `).trim());
        break;
      }
    }
  }
  return [...out].filter(Boolean);
}
