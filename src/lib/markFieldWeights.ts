import { PopColor } from "./colors";
import { CATEGORY_META } from "./types";
import { CURRENT_YEAR, YEAR_SNAPSHOTS } from "./mockData/insights";

/**
 * Turns the yearly relationship-type breakdown into MarkField cluster
 * weights, so the "patterns" field's color density reflects the same
 * numbers shown elsewhere (dating 38%, colleague+manager 35% as work
 * purple, etc.) instead of an arbitrary decorative split.
 */
export function relationshipColorWeights(): Partial<Record<PopColor, number>> {
  const weights: Partial<Record<PopColor, number>> = {};
  for (const { label, pct } of YEAR_SNAPSHOTS[CURRENT_YEAR].mostCommonRelationshipTypes) {
    const meta = Object.values(CATEGORY_META).find((m) => m.short === label);
    if (!meta || meta.color === "ink") continue;
    weights[meta.color] = (weights[meta.color] ?? 0) + pct;
  }
  return weights;
}
