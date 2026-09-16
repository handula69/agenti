// Orientační hodnoty z běžně publikovaných US baking konverzních tabulek.
// Slouží jen jako přibližný převod g -> cups pro konkrétní surovinu (různé
// suroviny mají různou objemovou hmotnost, obecný převod g<->ml by byl zavádějící).
export interface DensityEntry {
  key: string;
  labelCz: string;
  gramsPerCup?: number;
  gramsPerTsp?: number; // pro suroviny měřené lžičkami (kypřidla, sůl)
  aliases: string[];
}

export const densityTable: DensityEntry[] = [
  { key: "flour", labelCz: "Hladká mouka", gramsPerCup: 120, aliases: ["mouka", "hladká mouka", "polohrubá mouka", "flour", "all-purpose flour"] },
  { key: "powdered_sugar", labelCz: "Moučkový cukr", gramsPerCup: 120, aliases: ["moučkový cukr", "powdered sugar", "icing sugar"] },
  { key: "granulated_sugar", labelCz: "Krystalový cukr", gramsPerCup: 200, aliases: ["cukr", "krystalový cukr", "granulated sugar", "sugar"] },
  { key: "brown_sugar", labelCz: "Hnědý cukr", gramsPerCup: 220, aliases: ["hnědý cukr", "brown sugar"] },
  { key: "butter", labelCz: "Máslo", gramsPerCup: 227, aliases: ["máslo", "butter"] },
  { key: "milk", labelCz: "Mléko", gramsPerCup: 240, aliases: ["mléko", "milk"] },
  { key: "water", labelCz: "Voda", gramsPerCup: 240, aliases: ["voda", "water"] },
  { key: "heavy_cream", labelCz: "Smetana ke šlehání", gramsPerCup: 240, aliases: ["smetana", "smetana ke šlehání", "heavy cream", "whipping cream"] },
  { key: "oil", labelCz: "Olej", gramsPerCup: 218, aliases: ["olej", "oil", "vegetable oil"] },
  { key: "honey", labelCz: "Med", gramsPerCup: 340, aliases: ["med", "honey"] },
  { key: "cocoa", labelCz: "Kakao", gramsPerCup: 90, aliases: ["kakao", "cocoa", "cocoa powder"] },
  { key: "oats", labelCz: "Ovesné vločky", gramsPerCup: 90, aliases: ["ovesné vločky", "oats", "rolled oats"] },
  { key: "ground_nuts", labelCz: "Mleté ořechy / mandle", gramsPerCup: 96, aliases: ["mleté mandle", "mleté ořechy", "ground almonds", "ground nuts"] },
  { key: "shredded_cheese", labelCz: "Strouhaný sýr", gramsPerCup: 110, aliases: ["strouhaný sýr", "shredded cheese"] },
  { key: "rice", labelCz: "Syrová rýže", gramsPerCup: 185, aliases: ["rýže", "rice", "raw rice"] },
  { key: "baking_powder", labelCz: "Kypřicí prášek", gramsPerTsp: 4, aliases: ["kypřicí prášek", "baking powder"] },
  { key: "baking_soda", labelCz: "Jedlá soda", gramsPerTsp: 4.6, aliases: ["jedlá soda", "baking soda"] },
  { key: "salt", labelCz: "Sůl", gramsPerTsp: 6, aliases: ["sůl", "salt"] },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function findDensityEntry(nameCz: string, nameEn: string): DensityEntry | null {
  const candidates = [normalize(nameCz || ""), normalize(nameEn || "")].filter(Boolean);
  for (const entry of densityTable) {
    const aliases = entry.aliases.map(normalize);
    for (const candidate of candidates) {
      if (aliases.some((alias) => candidate === alias || candidate.includes(alias) || alias.includes(candidate))) {
        return entry;
      }
    }
  }
  return null;
}

export function getDensityEntryByKey(key: string | null): DensityEntry | null {
  if (!key) return null;
  return densityTable.find((e) => e.key === key) ?? null;
}
