"use client";

import { useState } from "react";
import { PRODUCTS, BY_ID } from "@/data/catalog";
import { DECOR } from "@/data/decor";
import { MAX_MONITORS, useBuild } from "@/lib/build-store";
import type { Slot } from "@/lib/types";
import { usd } from "@/lib/pricing";
import ProductCard from "./ProductCard";

type Tab = {
  id: string;
  label: string;
  slot: Slot | "decor";
  hint: string;
};

const TABS: Tab[] = [
  { id: "desk", label: "Desks", slot: "desk", hint: "Pick one — everything else sits on it." },
  { id: "chair", label: "Chairs", slot: "chair", hint: "Pick one. You'll be in it all day." },
  { id: "monitor", label: "Screens", slot: "monitor", hint: `Add up to ${MAX_MONITORS}. They arrange themselves.` },
  { id: "computer", label: "Computers", slot: "computer", hint: "Optional — bring your own if you'd rather." },
  { id: "peripheral", label: "Desk gear", slot: "peripheral", hint: "The bits that make it usable." },
  { id: "lighting", label: "Lighting", slot: "lighting", hint: "Bali evenings get dark fast." },
  { id: "comfort", label: "Comfort", slot: "comfort", hint: "Coffee, clean air, real internet." },
  { id: "active", label: "Play", slot: "active", hint: "For when the laptop closes." },
  { id: "decor", label: "Styling", slot: "decor", hint: "Free finishing touches — no charge." },
];

export default function Picker() {
  const { build, dispatch } = useBuild();
  const [tabId, setTabId] = useState("desk");
  const tab = TABS.find((t) => t.id === tabId) ?? TABS[0];

  const countFor = (t: Tab) => {
    switch (t.slot) {
      case "desk":
      case "chair":
        return 1;
      case "monitor":
        return build.monitorIds.length;
      case "computer":
        return build.computerId ? 1 : 0;
      case "decor":
        return build.decorIds.length;
      default:
        return build.addonIds.filter((id) => BY_ID.get(id)?.slot === t.slot).length;
    }
  };

  const monitorsFull = build.monitorIds.length >= MAX_MONITORS;

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col">
      {/* category rail */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3">
        {TABS.map((t) => {
          const n = countFor(t);
          const active = t.id === tabId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabId(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition
                ${active
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line bg-surface text-muted hover:border-accent/50 hover:text-foreground"}`}
            >
              {t.label}
              {n > 0 && (
                <span
                  className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold
                    ${active ? "bg-black/15 text-accent-ink" : "bg-accent-soft text-accent"}`}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="pb-3 text-[13px] text-muted">{tab.hint}</p>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {tab.slot === "decor" ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {DECOR.map((d) => {
              const selected = build.decorIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => dispatch({ type: "decor/toggle", id: d.id })}
                  aria-pressed={selected}
                  className={`rounded-2xl border p-3 text-left transition
                    ${selected
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:border-accent/60"}`}
                >
                  <p className="text-[13px] font-medium">{d.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{d.hint}</p>
                  <p className="mt-2 text-xs font-semibold text-accent">Free</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {PRODUCTS.filter((p) => p.slot === tab.slot).map((p) => {
              const selected =
                tab.slot === "desk"
                  ? build.deskId === p.id
                  : tab.slot === "chair"
                    ? build.chairId === p.id
                    : tab.slot === "monitor"
                      ? build.monitorIds.includes(p.id)
                      : tab.slot === "computer"
                        ? build.computerId === p.id
                        : build.addonIds.includes(p.id);

              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  selected={selected}
                  disabled={tab.slot === "monitor" && monitorsFull && !selected}
                  onToggle={() => {
                    switch (tab.slot) {
                      case "desk":
                        return dispatch({ type: "desk", id: p.id });
                      case "chair":
                        return dispatch({ type: "chair", id: p.id });
                      case "monitor": {
                        const at = build.monitorIds.indexOf(p.id);
                        return at >= 0
                          ? dispatch({ type: "monitor/removeAt", index: at })
                          : dispatch({ type: "monitor/add", id: p.id });
                      }
                      case "computer":
                        return dispatch({ type: "computer", id: p.id });
                      default:
                        return dispatch({ type: "addon/toggle", id: p.id });
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {tab.slot === "monitor" && build.monitorIds.length > 0 && (
          <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              On the desk, left to right
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {build.monitorIds.map((id, i) => {
                const p = BY_ID.get(id);
                if (!p) return null;
                return (
                  <li key={`${id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "monitor/removeAt", index: i })}
                      className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] hover:border-accent"
                    >
                      {p.name}
                      <span className="text-muted">{usd(p.weeklyPrice)}</span>
                      <span aria-hidden className="text-muted">&times;</span>
                      <span className="sr-only">Remove</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {monitorsFull && (
              <p className="mt-2 text-[11px] text-muted">
                That&rsquo;s the {MAX_MONITORS}-screen limit — remove one to swap.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
