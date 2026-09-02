"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { BY_ID } from "@/data/catalog";
import { DECOR_BY_ID } from "@/data/decor";
import type { Build } from "./types";

export const MAX_MONITORS = 3;

export const DEFAULT_BUILD: Build = {
  deskId: "electrical-adjustable-desk",
  chairId: "ergonomic-office-chair",
  monitorIds: ["27-work-monitor-a27i"],
  computerId: null,
  addonIds: ["logitech-mx-keyboard", "logitech-mx-master-mouse-s3", "smart-led-desk-lamp-1-s"],
  decorIds: ["plant"],
  standing: false,
  weeks: 4,
};

type Action =
  | { type: "desk"; id: string }
  | { type: "chair"; id: string }
  | { type: "monitor/add"; id: string }
  | { type: "monitor/removeAt"; index: number }
  | { type: "computer"; id: string | null }
  | { type: "addon/toggle"; id: string }
  | { type: "decor/toggle"; id: string }
  | { type: "standing"; value: boolean }
  | { type: "weeks"; value: number }
  | { type: "reset" }
  | { type: "hydrate"; build: Build };

function reducer(state: Build, action: Action): Build {
  switch (action.type) {
    case "desk": {
      const desk = BY_ID.get(action.id);
      // A desk that can't rise shouldn't leave the scene stuck in standing mode.
      return { ...state, deskId: action.id, standing: desk?.standing ? state.standing : false };
    }
    case "chair":
      return { ...state, chairId: action.id };
    case "monitor/add":
      return state.monitorIds.length >= MAX_MONITORS
        ? state
        : { ...state, monitorIds: [...state.monitorIds, action.id] };
    case "monitor/removeAt":
      return { ...state, monitorIds: state.monitorIds.filter((_, i) => i !== action.index) };
    case "computer":
      return { ...state, computerId: state.computerId === action.id ? null : action.id };
    case "addon/toggle":
      return {
        ...state,
        addonIds: state.addonIds.includes(action.id)
          ? state.addonIds.filter((x) => x !== action.id)
          : [...state.addonIds, action.id],
      };
    case "decor/toggle":
      return {
        ...state,
        decorIds: state.decorIds.includes(action.id)
          ? state.decorIds.filter((x) => x !== action.id)
          : [...state.decorIds, action.id],
      };
    case "standing":
      return { ...state, standing: action.value };
    case "weeks":
      return { ...state, weeks: Math.min(52, Math.max(1, Math.round(action.value))) };
    case "reset":
      return DEFAULT_BUILD;
    case "hydrate":
      return action.build;
  }
}

const STORAGE_KEY = "monis-workspace-build-v1";

/** Drops anything that doesn't match a real product, so old links never crash the scene. */
function sanitize(input: unknown): Build | null {
  if (!input || typeof input !== "object") return null;
  const b = input as Partial<Build>;
  const desk = typeof b.deskId === "string" && BY_ID.get(b.deskId)?.slot === "desk" ? b.deskId : null;
  const chair = typeof b.chairId === "string" && BY_ID.get(b.chairId)?.slot === "chair" ? b.chairId : null;
  if (!desk || !chair) return null;
  return {
    deskId: desk,
    chairId: chair,
    monitorIds: (Array.isArray(b.monitorIds) ? b.monitorIds : [])
      .filter((id) => BY_ID.get(id)?.slot === "monitor")
      .slice(0, MAX_MONITORS),
    computerId:
      typeof b.computerId === "string" && BY_ID.get(b.computerId)?.slot === "computer"
        ? b.computerId
        : null,
    addonIds: (Array.isArray(b.addonIds) ? b.addonIds : []).filter((id) => {
      const slot = BY_ID.get(id)?.slot;
      return slot === "lighting" || slot === "peripheral" || slot === "comfort" || slot === "active";
    }),
    decorIds: (Array.isArray(b.decorIds) ? b.decorIds : []).filter((id) => DECOR_BY_ID.has(id)),
    standing: Boolean(b.standing) && Boolean(BY_ID.get(desk)?.standing),
    weeks: Math.min(52, Math.max(1, Math.round(Number(b.weeks) || 4))),
  };
}

export function encodeBuild(build: Build): string {
  const compact = [
    build.deskId,
    build.chairId,
    build.monitorIds.join("~"),
    build.computerId ?? "",
    build.addonIds.join("~"),
    build.decorIds.join("~"),
    build.standing ? "1" : "0",
    String(build.weeks),
  ].join("|");
  return encodeURIComponent(compact);
}

export function decodeBuild(raw: string): Build | null {
  try {
    const [deskId, chairId, monitors, computer, addons, decor, standing, weeks] =
      decodeURIComponent(raw).split("|");
    return sanitize({
      deskId,
      chairId,
      monitorIds: monitors ? monitors.split("~") : [],
      computerId: computer || null,
      addonIds: addons ? addons.split("~") : [],
      decorIds: decor ? decor.split("~") : [],
      standing: standing === "1",
      weeks: Number(weeks),
    });
  } catch {
    return null;
  }
}

type Store = { build: Build; dispatch: (a: Action) => void };
const BuildContext = createContext<Store | null>(null);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [build, dispatch] = useReducer(reducer, DEFAULT_BUILD);

  // A shared link wins over whatever this browser had saved.
  useEffect(() => {
    const fromHash = window.location.hash.startsWith("#s=")
      ? decodeBuild(window.location.hash.slice(3))
      : null;
    if (fromHash) {
      dispatch({ type: "hydrate", build: fromHash });
      return;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? sanitize(JSON.parse(saved)) : null;
      if (parsed) dispatch({ type: "hydrate", build: parsed });
    } catch {
      // Private mode, blocked storage — the default build is a fine place to start.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch {
      // Not being able to remember the setup shouldn't break designing it.
    }
  }, [build]);

  const value = useMemo(() => ({ build, dispatch }), [build]);
  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}

export function useBuild(): Store {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used inside <BuildProvider>");
  return ctx;
}
