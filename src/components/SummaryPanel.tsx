"use client";

import { useMemo } from "react";
import { BY_ID } from "@/data/catalog";
import { useBuild } from "@/lib/build-store";
import { nextTier, quote, usd } from "@/lib/pricing";

const WEEK_PRESETS = [1, 2, 4, 8, 12];

export default function SummaryPanel({ onCheckout }: { onCheckout: () => void }) {
  const { build, dispatch } = useBuild();
  const q = useMemo(() => quote(build), [build]);
  const upcoming = nextTier(q.itemCount);

  // Group repeats so three identical monitors read as "3 ×" rather than three rows.
  const lines = useMemo(() => {
    const map = new Map<string, { id: string; qty: number }>();
    for (const p of q.items) {
      const cur = map.get(p.id);
      if (cur) cur.qty += 1;
      else map.set(p.id, { id: p.id, qty: 1 });
    }
    return [...map.values()];
  }, [q.items]);

  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
      <div>
        <h2 className="text-sm font-semibold">Your setup</h2>
        <p className="text-[11px] text-muted">
          {q.itemCount} {q.itemCount === 1 ? "item" : "items"} · delivered in Bali
        </p>
      </div>

      {/* The fade only belongs where the panel is height-capped and actually scrolls. */}
      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 text-[13px] lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%-24px),transparent)]">
        {lines.map(({ id, qty }) => {
          const p = BY_ID.get(id);
          if (!p) return null;
          return (
            <li key={id} className="flex items-baseline justify-between gap-3">
              <span className="truncate">
                {qty > 1 && <span className="text-muted">{qty} × </span>}
                {p.name}
              </span>
              <span className="shrink-0 tabular-nums text-muted">
                {usd(p.weeklyPrice * qty)}
              </span>
            </li>
          );
        })}
      </ul>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="weeks" className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Rental length
          </label>
          <span className="text-[13px] font-medium">
            {build.weeks} {build.weeks === 1 ? "week" : "weeks"}
          </span>
        </div>
        <input
          id="weeks"
          type="range"
          min={1}
          max={52}
          value={build.weeks}
          onChange={(e) => dispatch({ type: "weeks", value: Number(e.target.value) })}
          className="w-full accent-[var(--accent)]"
        />
        <div className="mt-1.5 flex gap-1">
          {WEEK_PRESETS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => dispatch({ type: "weeks", value: w })}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                build.weeks === w
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:border-accent/50"
              }`}
            >
              {w}w
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 border-t border-line pt-3 text-[13px]">
        <div className="flex justify-between text-muted">
          <span>Weekly subtotal</span>
          <span className="tabular-nums">{usd(q.weeklySubtotal)}</span>
        </div>
        {q.discountRate > 0 && (
          <div className="flex justify-between font-medium text-accent">
            <span>Bundle discount &minus;{Math.round(q.discountRate * 100)}%</span>
            <span className="tabular-nums">&minus;{usd(q.weeklyDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted">Per week</span>
          <span className="tabular-nums font-medium">{usd(q.weeklyTotal)}</span>
        </div>
        <div className="flex items-baseline justify-between pt-1.5 text-base font-semibold">
          <span>{build.weeks}-week total</span>
          <span className="tabular-nums">{usd(q.total)}</span>
        </div>
        <p className="pt-0.5 text-[11px] text-muted">
          Plus a refundable {usd(q.deposit)} deposit. Free delivery &amp; pickup.
        </p>
      </div>

      {upcoming && (
        <p className="rounded-xl bg-accent-soft px-3 py-2 text-[11px] text-accent">
          Add {upcoming.needed} more {upcoming.needed === 1 ? "item" : "items"} to unlock{" "}
          {Math.round(upcoming.rate * 100)}% off.
        </p>
      )}

      <button
        type="button"
        onClick={onCheckout}
        className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition hover:opacity-90 active:scale-[0.99]"
      >
        Rent this setup · {usd(q.total)}
      </button>
    </aside>
  );
}
