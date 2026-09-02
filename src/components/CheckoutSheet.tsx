"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BY_ID } from "@/data/catalog";
import { DECOR_BY_ID } from "@/data/decor";
import { useBuild } from "@/lib/build-store";
import { quote, usd } from "@/lib/pricing";
import WorkspaceScene from "./scene/WorkspaceScene";

const AREAS = ["Canggu", "Berawa", "Pererenan", "Seminyak", "Uluwatu", "Ubud", "Sanur"];

/** Rendered only while open, so each visit starts as an order rather than a receipt. */
export default function CheckoutSheet({ onClose }: { onClose: () => void }) {
  const { build } = useBuild();
  const q = useMemo(() => quote(build), [build]);
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", area: AREAS[0], start: "" });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Stop the page behind the sheet from scrolling under it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const lines = (() => {
    const map = new Map<string, number>();
    for (const p of q.items) map.set(p.id, (map.get(p.id) ?? 0) + 1);
    return [...map.entries()];
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={placed ? "Reservation confirmed" : "Review and rent your setup"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-line bg-surface shadow-2xl outline-none sm:rounded-3xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/95 px-5 py-3.5 backdrop-blur">
          <div>
            <h2 className="text-base font-semibold">
              {placed ? "You're all set" : "Review your setup"}
            </h2>
            <p className="text-[11px] text-muted">
              {placed
                ? "We'll confirm by email within the hour."
                : `${q.itemCount} items · ${build.weeks} ${build.weeks === 1 ? "week" : "weeks"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted transition hover:text-foreground"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {placed ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold">Your workspace is reserved</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
              {q.itemCount} items heading to {form.area}
              {form.start ? ` on ${form.start}` : " on your chosen date"}. Same-day delivery by
              GoJek once confirmed — {usd(q.total)} for {build.weeks}{" "}
              {build.weeks === 1 ? "week" : "weeks"}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full border border-line px-5 py-2.5 text-sm font-medium transition hover:border-accent"
            >
              Back to the designer
            </button>
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-line">
                <div className="h-56 sm:h-64">
                  <WorkspaceScene build={build} />
                </div>
              </div>

              <ul className="space-y-1.5 text-[13px]">
                {lines.map(([id, qty]) => {
                  const p = BY_ID.get(id);
                  if (!p) return null;
                  return (
                    <li key={id} className="flex items-baseline justify-between gap-3">
                      <span className="truncate">
                        {qty > 1 && <span className="text-muted">{qty} × </span>}
                        {p.name}
                        <span className="ml-1.5 text-[11px] text-muted">{p.category}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted">
                        {usd(p.weeklyPrice * qty)}/wk
                      </span>
                    </li>
                  );
                })}
                {build.decorIds.length > 0 && (
                  <li className="flex items-baseline justify-between gap-3 text-muted">
                    <span className="truncate">
                      Styling: {build.decorIds.map((d) => DECOR_BY_ID.get(d)?.name).filter(Boolean).join(", ")}
                    </span>
                    <span className="shrink-0">Free</span>
                  </li>
                )}
              </ul>

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
                  <span className="text-muted">
                    {usd(q.weeklyTotal)}/week × {build.weeks}
                  </span>
                  <span className="tabular-nums">{usd(q.total)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Refundable deposit</span>
                  <span className="tabular-nums">{usd(q.deposit)}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1.5 text-base font-semibold">
                  <span>Due today</span>
                  <span className="tabular-nums">{usd(q.total + q.deposit)}</span>
                </div>
              </div>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setPlaced(true);
              }}
            >
              <Field label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="Ayu Pratama"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Delivery area">
                <select
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                >
                  {AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start date">
                <input
                  required
                  type="date"
                  ref={(el) => {
                    // Commit phase, not render — earliest delivery is tomorrow.
                    if (el && !el.min) el.min = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
                  }}
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </Field>

              <button
                type="submit"
                className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition hover:opacity-90 active:scale-[0.99]"
              >
                Confirm reservation
              </button>
              <p className="text-center text-[11px] text-muted">
                Demo checkout — nothing is charged and no order is sent.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
