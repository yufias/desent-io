import { BY_ID } from "@/data/catalog";
import type { Build, Product } from "./types";

/**
 * Monis sells curated bundles at a 20% discount. We mirror that idea here:
 * the more of your setup you rent in one go, the better the rate.
 */
export const TIERS = [
  { minItems: 8, rate: 0.2 },
  { minItems: 6, rate: 0.15 },
  { minItems: 4, rate: 0.1 },
  { minItems: 3, rate: 0.05 },
] as const;

export function buildItems(build: Build): Product[] {
  const ids = [
    build.deskId,
    build.chairId,
    ...build.monitorIds,
    build.computerId,
    ...build.addonIds,
  ].filter((id): id is string => Boolean(id));

  // De-dupe while keeping order — the same monitor can be picked twice.
  const seen = new Map<string, number>();
  const items: Product[] = [];
  for (const id of ids) {
    const p = BY_ID.get(id);
    if (!p) continue;
    seen.set(id, (seen.get(id) ?? 0) + 1);
    items.push(p);
  }
  return items;
}

export type Quote = {
  items: Product[];
  itemCount: number;
  weeklySubtotal: number;
  discountRate: number;
  weeklyDiscount: number;
  weeklyTotal: number;
  total: number;
  /** What Monis would charge as a refundable deposit — 2 weeks, capped. */
  deposit: number;
};

export function quote(build: Build): Quote {
  const items = buildItems(build);
  const weeklySubtotal = items.reduce((sum, p) => sum + p.weeklyPrice, 0);
  const tier = TIERS.find((t) => items.length >= t.minItems);
  const discountRate = tier?.rate ?? 0;
  const weeklyDiscount = weeklySubtotal * discountRate;
  const weeklyTotal = weeklySubtotal - weeklyDiscount;
  return {
    items,
    itemCount: items.length,
    weeklySubtotal,
    discountRate,
    weeklyDiscount,
    weeklyTotal,
    total: weeklyTotal * build.weeks,
    deposit: Math.min(weeklyTotal * 2, 250),
  };
}

export function nextTier(itemCount: number) {
  const upcoming = [...TIERS].reverse().find((t) => t.minItems > itemCount);
  return upcoming ? { ...upcoming, needed: upcoming.minItems - itemCount } : null;
}

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
