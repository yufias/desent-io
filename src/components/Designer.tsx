"use client";

import { useState } from "react";
import { BuildProvider, useBuild } from "@/lib/build-store";
import CheckoutSheet from "./CheckoutSheet";
import Picker from "./Picker";
import StageControls from "./StageControls";
import SummaryPanel from "./SummaryPanel";
import WorkspaceScene from "./scene/WorkspaceScene";

function Stage() {
  const { build } = useBuild();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-[var(--stage)]">
      {/* Fixed height rather than an aspect box: the picker below needs the leftovers. */}
      <div className="h-[38vh] max-h-[420px] min-h-[240px] w-full lg:h-[44vh]">
        <WorkspaceScene build={build} />
      </div>
      <StageControls />
    </div>
  );
}

function Shell() {
  const [checkout, setCheckout] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col gap-4 px-4 py-5 lg:h-dvh lg:py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            monis.rent · Bali
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Design your workspace
          </h1>
        </div>
        <p className="max-w-sm text-[13px] leading-snug text-muted">
          Build the setup you actually want, watch it come together, then rent the whole
          thing by the week. Delivered and collected across Bali.
        </p>
      </header>

      <main className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          <Stage />
          <div className="min-h-0 min-w-0 flex-1 lg:overflow-hidden">
            <Picker />
          </div>
        </div>
        <SummaryPanel onCheckout={() => setCheckout(true)} />
      </main>

      {checkout && <CheckoutSheet onClose={() => setCheckout(false)} />}
    </div>
  );
}

export default function Designer() {
  return (
    <BuildProvider>
      <Shell />
    </BuildProvider>
  );
}
