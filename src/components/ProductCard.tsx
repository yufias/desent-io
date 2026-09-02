"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { usd } from "@/lib/pricing";

export default function ProductCard({
  product,
  selected,
  disabled = false,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      aria-pressed={selected}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition
        ${selected
          ? "border-accent bg-accent-soft shadow-sm"
          : "border-line bg-surface hover:border-accent/60 hover:shadow-sm"}
        disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:shadow-none`}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
        {selected && (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-ink">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M4 10.5 8 14.5 16 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[13px] leading-snug font-medium">{product.name}</p>
        <p className="text-[11px] leading-snug text-muted">{product.blurb}</p>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-sm font-semibold text-accent">{usd(product.weeklyPrice)}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted">/week</span>
        </div>
      </div>
    </button>
  );
}
