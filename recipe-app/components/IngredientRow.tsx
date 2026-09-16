import { Ingredient } from "@/lib/types";
import { formatMetricUnit, formatUsUnit } from "@/lib/units";
import { DisplayMode } from "./UnitToggle";

export function IngredientRow({ ingredient, mode }: { ingredient: Ingredient; mode: DisplayMode }) {
  const name = mode === "cz" ? ingredient.name_cz : ingredient.name_en;
  const isApprox = mode === "en" && ingredient.unit_metric !== "ks";
  const isUnmatched = mode === "en" && ingredient.unit_metric === "g" && !ingredient.density_key;

  const value =
    mode === "cz"
      ? formatMetricUnit(ingredient.unit_metric, ingredient.amount_metric)
      : formatUsUnit(ingredient.unit_us, ingredient.amount_us);

  return (
    <li className="flex items-start justify-between gap-3 py-1.5 border-b border-stone-100 last:border-0">
      <span className="text-stone-800">{name || <span className="text-stone-400 italic">(bez názvu)</span>}</span>
      <span className="text-right shrink-0">
        <span className="font-medium text-stone-900">{value}</span>
        {isApprox && (
          <span
            title={
              isUnmatched
                ? "Surovina není v tabulce hustot - orientační převod pouze podle hmotnosti."
                : "Přibližný převod (závisí na hustotě konkrétní suroviny)."
            }
            className="ml-1 align-top text-[10px] uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1"
          >
            ≈ přibližně
          </span>
        )}
      </span>
    </li>
  );
}
