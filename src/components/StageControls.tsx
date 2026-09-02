"use client";

import { useState } from "react";
import { BY_ID, PRODUCTS } from "@/data/catalog";
import { DECOR } from "@/data/decor";
import { encodeBuild, useBuild, MAX_MONITORS } from "@/lib/build-store";

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function StageControls() {
  const { build, dispatch } = useBuild();
  const [copied, setCopied] = useState(false);
  const deskRises = Boolean(BY_ID.get(build.deskId)?.standing);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#s=${encodeBuild(build)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; putting it in the address bar still lets them copy it.
      window.location.hash = `s=${encodeBuild(build)}`;
    }
  };

  const surprise = () => {
    const inSlot = (slot: string) => PRODUCTS.filter((p) => p.slot === slot);
    dispatch({ type: "desk", id: pick(inSlot("desk")).id });
    dispatch({ type: "chair", id: pick(inSlot("chair")).id });
    for (let i = build.monitorIds.length - 1; i >= 0; i--) {
      dispatch({ type: "monitor/removeAt", index: i });
    }
    const screens = inSlot("monitor");
    const n = 1 + Math.floor(Math.random() * MAX_MONITORS);
    for (let i = 0; i < n; i++) dispatch({ type: "monitor/add", id: pick(screens).id });

    for (const id of build.addonIds) dispatch({ type: "addon/toggle", id });
    const extras = PRODUCTS.filter((p) =>
      ["lighting", "peripheral", "comfort", "active"].includes(p.slot),
    );
    const chosen = new Set<string>();
    while (chosen.size < 5) chosen.add(pick(extras).id);
    for (const id of chosen) dispatch({ type: "addon/toggle", id });

    for (const d of DECOR) {
      const want = Math.random() > 0.5;
      if (want !== build.decorIds.includes(d.id)) dispatch({ type: "decor/toggle", id: d.id });
    }
  };

  const btn =
    "rounded-full border border-line bg-surface/85 px-3 py-1.5 text-[12px] font-medium backdrop-blur transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="pointer-events-none flex flex-wrap items-center justify-between gap-2 border-t border-line p-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-t-0">
      <div className="pointer-events-auto flex items-center gap-1.5">
        <div className="flex rounded-full border border-line bg-surface/85 p-0.5 backdrop-blur">
          {[
            { label: "Sitting", value: false },
            { label: "Standing", value: true },
          ].map((mode) => (
            <button
              key={mode.label}
              type="button"
              disabled={!deskRises && mode.value}
              title={!deskRises && mode.value ? "This desk doesn't rise" : undefined}
              onClick={() => dispatch({ type: "standing", value: mode.value })}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                build.standing === mode.value ? "bg-accent text-accent-ink" : "text-muted"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-1.5">
        <button type="button" onClick={surprise} className={btn}>
          Surprise me
        </button>
        <button type="button" onClick={share} className={btn}>
          {copied ? "Link copied" : "Share"}
        </button>
        <button type="button" onClick={() => dispatch({ type: "reset" })} className={btn}>
          Reset
        </button>
      </div>
    </div>
  );
}
