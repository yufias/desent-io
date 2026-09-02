export type Slot =
  | "desk"
  | "chair"
  | "monitor"
  | "computer"
  | "lighting"
  | "peripheral"
  | "comfort"
  | "active";

export type Product = {
  id: string;
  name: string;
  category: string;
  weeklyPrice: number;
  image: string;
  rating: number | null;
  description: string;
  slot: Slot;
  art: string;
  blurb: string;
  /** Scene hints — only present on the slots that use them. */
  deskWidth?: number;
  standing?: boolean;
  back?: "low" | "mid" | "high";
  headrest?: boolean;
  screenW?: number;
  screenH?: number;
};

/** Everything the user has chosen. This is the whole app state. */
export type Build = {
  deskId: string;
  chairId: string;
  /** Ordered, max 3 — position on the desk follows this order. */
  monitorIds: string[];
  computerId: string | null;
  /** Toggleable extras across lighting / peripheral / comfort / active. */
  addonIds: string[];
  /** Free styling touches, no charge. */
  decorIds: string[];
  standing: boolean;
  weeks: number;
};
