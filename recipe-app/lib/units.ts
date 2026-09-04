import { MetricUnit, UsUnit } from "./types";
import { findDensityEntry, getDensityEntryByKey } from "./densityTable";

const ML_PER_CUP = 240;
const TBSP_PER_CUP = 16;
const TSP_PER_CUP = 48;
const G_PER_OZ = 28.3495;

export interface ConversionResult {
  amount: number | null;
  unit: UsUnit | null;
  approx: boolean;
  matched: boolean; // false = surovina nenalezena v tabulce hustot, hodnota je jen orientační (oz podle váhy)
  densityKey: string | null;
}

function roundNice(n: number): number {
  // zaokrouhlí na 1/4 pro menší hodnoty, jinak na 1 desetinné místo
  if (n < 4) return Math.round(n * 4) / 4;
  return Math.round(n * 10) / 10;
}

function volumeFromMl(ml: number): { amount: number; unit: UsUnit } {
  const cups = ml / ML_PER_CUP;
  if (cups >= 0.25) return { amount: roundNice(cups), unit: "cup" };
  const tbsp = ml / (ML_PER_CUP / TBSP_PER_CUP);
  if (tbsp >= 1) return { amount: roundNice(tbsp), unit: "tbsp" };
  const tsp = ml / (ML_PER_CUP / TSP_PER_CUP);
  return { amount: roundNice(tsp), unit: "tsp" };
}

/**
 * Převede metrické množství na US jednotku. Návrat je vždy orientační
 * (approx: true), s výjimkou kusů, kde k žádnému přepočtu nedochází.
 */
export function convertToUs(
  amountMetric: number | null,
  unitMetric: MetricUnit,
  nameCz: string,
  nameEn: string,
  densityKeyOverride?: string | null
): ConversionResult {
  if (amountMetric === null || amountMetric === undefined) {
    return { amount: null, unit: null, approx: false, matched: false, densityKey: densityKeyOverride ?? null };
  }

  switch (unitMetric) {
    case "ks":
      return { amount: amountMetric, unit: "ks", approx: false, matched: true, densityKey: null };
    case "lžíce":
      return { amount: amountMetric, unit: "tbsp", approx: true, matched: true, densityKey: null };
    case "lžička":
      return { amount: amountMetric, unit: "tsp", approx: true, matched: true, densityKey: null };
    case "špetka":
      return { amount: amountMetric, unit: "pinch", approx: true, matched: true, densityKey: null };
    case "ml": {
      const v = volumeFromMl(amountMetric);
      return { amount: v.amount, unit: v.unit, approx: true, matched: true, densityKey: null };
    }
    case "g": {
      const entry = densityKeyOverride
        ? getDensityEntryByKey(densityKeyOverride)
        : findDensityEntry(nameCz, nameEn);

      if (entry?.gramsPerTsp) {
        const tsp = amountMetric / entry.gramsPerTsp;
        return { amount: roundNice(tsp), unit: "tsp", approx: true, matched: true, densityKey: entry.key };
      }
      if (entry?.gramsPerCup) {
        const ml = (amountMetric / entry.gramsPerCup) * ML_PER_CUP;
        const v = volumeFromMl(ml);
        return { amount: v.amount, unit: v.unit, approx: true, matched: true, densityKey: entry.key };
      }
      // neznámá surovina - orientační převod jen podle váhy (oz), objem neumíme odhadnout
      const oz = amountMetric / G_PER_OZ;
      return { amount: roundNice(oz), unit: "oz", approx: true, matched: false, densityKey: null };
    }
    default:
      return { amount: amountMetric, unit: null, approx: true, matched: false, densityKey: null };
  }
}

export function formatUsUnit(unit: UsUnit | null, amount: number | null): string {
  if (amount === null || unit === null) return "-";
  const labels: Record<UsUnit, string> = {
    cup: amount === 1 ? "cup" : "cups",
    tbsp: "tbsp",
    tsp: "tsp",
    oz: "oz",
    ks: "pcs",
    pinch: "pinch",
  };
  return `${amount} ${labels[unit]}`;
}

export function formatMetricUnit(unit: MetricUnit, amount: number | null): string {
  if (amount === null) return "-";
  return `${amount} ${unit}`;
}
