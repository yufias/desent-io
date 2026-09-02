/**
 * Line-art props for the workspace scene.
 *
 * Convention: every piece draws in local coordinates with its origin at
 * BOTTOM-CENTER — x spans ±w/2, y runs from -height up to 0. Placing anything
 * is then just `translate(x, groundY)`, which is what keeps the composition
 * logic in WorkspaceScene readable.
 */
import type { ReactElement } from "react";

const S = {
  fill: "none",
  stroke: "var(--ink)",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const BODY = { ...S, fill: "var(--obj)" } as const;
const SCREEN = { ...S, fill: "var(--screen)" } as const;
const SOFT = { ...S, strokeWidth: 1.6, stroke: "var(--ink-soft)" } as const;

/* ---------------------------------------------------------------- desks -- */

export function DeskElectric({ width, height }: { width: number; height: number }) {
  const w = width;
  const legX = w / 2 - 62;
  const topT = 14;
  const upper = (height - topT) * 0.52;
  return (
    <g>
      <rect {...BODY} x={-w / 2} y={-height} width={w} height={topT} rx={5} />
      {[-legX, legX].map((x) => (
        <g key={x}>
          <rect {...BODY} x={x - 12} y={-height + topT} width={24} height={upper} rx={4} />
          <rect {...BODY} x={x - 8.5} y={-height + topT + upper - 2} width={17} height={height - topT - upper - 10} rx={3} />
          <rect {...BODY} x={x - 46} y={-12} width={92} height={12} rx={6} />
        </g>
      ))}
      {/* height controller */}
      <rect {...BODY} x={w / 2 - 92} y={-height + topT + 3} width={34} height={12} rx={3} />
      <line {...SOFT} x1={w / 2 - 84} y1={-height + topT + 9} x2={w / 2 - 66} y2={-height + topT + 9} />
    </g>
  );
}

export function DeskWood({ width, height }: { width: number; height: number }) {
  const w = width;
  const topT = 17;
  const legX = w / 2 - 34;
  const backX = w / 2 - 74;
  return (
    <g>
      {/* back legs read as depth */}
      {[-backX, backX].map((x) => (
        <line key={`b${x}`} {...SOFT} x1={x} y1={-height + topT} x2={x} y2={-26} />
      ))}
      <rect {...BODY} x={-w / 2} y={-height} width={w} height={topT} rx={7} />
      <line {...SOFT} x1={-w / 2 + 14} y1={-height + 8.5} x2={w / 2 - 14} y2={-height + 8.5} />
      {[-legX, legX].map((x) => (
        <path
          key={x}
          {...BODY}
          d={`M ${x - 11} ${-height + topT} L ${x + 11} ${-height + topT} L ${x + 8} 0 L ${x - 8} 0 Z`}
        />
      ))}
      {/* crank */}
      <line {...S} x1={w / 2 - 6} y1={-height + 30} x2={w / 2 + 16} y2={-height + 30} />
      <circle {...BODY} cx={w / 2 + 18} cy={-height + 30} r={5} />
    </g>
  );
}

/* --------------------------------------------------------------- chairs -- */

export function Chair({
  back = "mid",
  headrest = false,
  mesh = false,
}: {
  back?: "low" | "mid" | "high";
  headrest?: boolean;
  mesh?: boolean;
}) {
  const backH = back === "low" ? 86 : back === "mid" ? 122 : 152;
  const seatY = -168;
  const backTop = seatY - backH;
  return (
    <g>
      {/* star base */}
      {[[-92, -16], [-50, -12], [50, -12], [92, -16]].map(([x, y], i) => (
        <line key={i} {...S} x1={0} y1={-64} x2={x} y2={y} />
      ))}
      {[-92, -50, 50, 92].map((x) => (
        <ellipse key={x} {...BODY} cx={x} cy={-8} rx={10} ry={8} />
      ))}
      {/* gas lift */}
      <rect {...BODY} x={-10} y={-140} width={20} height={80} rx={5} />
      {/* seat */}
      <rect {...BODY} x={-74} y={seatY} width={148} height={30} rx={12} />
      {/* armrests */}
      {[-1, 1].map((s) => (
        <path
          key={s}
          {...S}
          d={`M ${s * 66} ${seatY + 6} L ${s * 84} ${seatY - 6} L ${s * 84} ${seatY - 34} L ${s * 58} ${seatY - 40}`}
        />
      ))}
      {/* back */}
      <path
        {...BODY}
        d={`M -58 ${seatY + 4} L -64 ${backTop + 18} Q -64 ${backTop} -46 ${backTop} L 46 ${backTop} Q 64 ${backTop} 64 ${backTop + 18} L 58 ${seatY + 4} Z`}
      />
      {mesh &&
        [0.25, 0.45, 0.65, 0.85].map((f) => (
          <line
            key={f}
            {...SOFT}
            x1={-52}
            y1={backTop + backH * f}
            x2={52}
            y2={backTop + backH * f}
          />
        ))}
      {headrest && (
        <>
          <line {...S} x1={0} y1={backTop} x2={0} y2={backTop - 12} />
          <rect {...BODY} x={-36} y={backTop - 42} width={72} height={32} rx={14} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------- monitors -- */

const NECK = 48;
const MBASE = 10;

export function Monitor({ w, h, curved = false }: { w: number; h: number; curved?: boolean }) {
  const bottom = -(MBASE + NECK);
  const top = bottom - h;
  return (
    <g>
      <rect {...BODY} x={-52} y={-MBASE} width={104} height={MBASE} rx={5} />
      <rect {...BODY} x={-13} y={bottom} width={26} height={NECK} rx={4} />
      {curved ? (
        <>
          <path
            {...BODY}
            d={`M ${-w / 2} ${top + 14} Q 0 ${top - 12} ${w / 2} ${top + 14} L ${w / 2} ${bottom - 6} Q 0 ${bottom + 18} ${-w / 2} ${bottom - 6} Z`}
          />
          <path
            {...SCREEN}
            d={`M ${-w / 2 + 9} ${top + 21} Q 0 ${top - 3} ${w / 2 - 9} ${top + 21} L ${w / 2 - 9} ${bottom - 14} Q 0 ${bottom + 8} ${-w / 2 + 9} ${bottom - 14} Z`}
          />
        </>
      ) : (
        <>
          <rect {...BODY} x={-w / 2} y={top} width={w} height={h} rx={9} />
          <rect {...SCREEN} x={-w / 2 + 8} y={top + 8} width={w - 16} height={h - 20} rx={4} />
        </>
      )}
    </g>
  );
}

/** Height of a monitor from the desk surface — the scene needs this to stack things on top. */
export const monitorHeight = (h: number) => MBASE + NECK + h;

/* ---------------------------------------------------------- desk things -- */

export function Keyboard() {
  return (
    <g>
      <rect {...BODY} x={-78} y={-11} width={156} height={11} rx={3} />
      {[-58, -34, -10, 14, 38].map((x) => (
        <line key={x} {...SOFT} x1={x} y1={-8} x2={x + 16} y2={-8} />
      ))}
    </g>
  );
}

export function Mouse() {
  return <path {...BODY} d="M -11 0 L -11 -10 Q -11 -20 0 -20 Q 11 -20 11 -10 L 11 0 Z" />;
}

export function Laptop() {
  return (
    <g>
      <path {...BODY} d="M -56 0 L 56 0 L 62 -8 L -62 -8 Z" />
      <path {...SCREEN} d="M -48 -8 L -40 -68 L 52 -68 L 46 -8 Z" />
    </g>
  );
}

export function LaptopStand() {
  return (
    <g>
      <path {...BODY} d="M -50 0 L -34 -34 L 50 -34 L 34 0 Z" />
      <line {...SOFT} x1={-30} y1={-30} x2={44} y2={-30} />
    </g>
  );
}

export function MiniPC() {
  return (
    <g>
      <rect {...BODY} x={-34} y={-22} width={68} height={22} rx={6} />
      <circle {...SOFT} cx={22} cy={-11} r={3} />
    </g>
  );
}

export function DeskLamp() {
  return (
    <g>
      <ellipse {...BODY} cx={0} cy={-5} rx={26} ry={7} />
      <line {...S} x1={0} y1={-8} x2={-2} y2={-66} />
      <line {...S} x1={-2} y1={-66} x2={38} y2={-88} />
      <path {...BODY} d="M 30 -80 L 52 -92 L 44 -106 L 22 -94 Z" />
      <path fill="var(--glow)" stroke="none" d="M 28 -88 L 88 -30 L 2 -30 Z" opacity={0.22} />
    </g>
  );
}

export function LightBar() {
  return (
    <g>
      <rect {...BODY} x={-58} y={-9} width={116} height={9} rx={4} />
      <path fill="var(--glow)" stroke="none" d="M -54 -2 L 54 -2 L 76 22 L -76 22 Z" opacity={0.18} />
    </g>
  );
}

export function Webcam() {
  return (
    <g>
      <rect {...BODY} x={-17} y={-16} width={34} height={16} rx={7} />
      <circle {...SCREEN} cx={0} cy={-8} r={5} />
    </g>
  );
}

export function Hub() {
  return (
    <g>
      <rect {...BODY} x={-24} y={-7} width={48} height={7} rx={3} />
      <line {...SOFT} x1={-14} y1={-3.5} x2={14} y2={-3.5} />
    </g>
  );
}

export function PowerStrip() {
  return (
    <g>
      <rect {...BODY} x={-38} y={-10} width={76} height={10} rx={4} />
      {[-22, -4, 14].map((x) => (
        <rect key={x} {...SOFT} x={x} y={-7} width={10} height={4} rx={1} />
      ))}
    </g>
  );
}

export function MicOnBoom() {
  return (
    <g>
      <ellipse {...BODY} cx={0} cy={-5} rx={20} ry={6} />
      <line {...S} x1={0} y1={-8} x2={0} y2={-58} />
      <line {...S} x1={0} y1={-58} x2={62} y2={-78} />
      <line {...S} x1={62} y1={-78} x2={92} y2={-58} />
      <rect {...BODY} x={82} y={-58} width={20} height={40} rx={9} />
      {[-50, -40, -30].map((y) => (
        <line key={y} {...SOFT} x1={86} y1={y} x2={98} y2={y} />
      ))}
    </g>
  );
}

export function BoomArm() {
  return (
    <g>
      <rect {...BODY} x={-8} y={-30} width={16} height={30} rx={3} />
      <line {...S} x1={0} y1={-30} x2={54} y2={-54} />
      <line {...S} x1={54} y1={-54} x2={96} y2={-38} />
    </g>
  );
}

/* -------------------------------------------------------- floor & walls -- */

export function Plant() {
  return (
    <g transform="scale(0.72)">
      <path {...BODY} d="M -26 0 L -20 -46 L 20 -46 L 26 0 Z" />
      <line {...S} x1={0} y1={-46} x2={0} y2={-104} />
      {[
        "M 0 -96 Q -40 -104 -46 -74 Q -14 -70 0 -88",
        "M 0 -80 Q 38 -92 46 -62 Q 14 -56 0 -74",
        "M 0 -104 Q -14 -140 14 -150 Q 30 -124 6 -104",
        "M 0 -62 Q -34 -60 -38 -40 Q -10 -40 0 -56",
      ].map((d) => (
        <path key={d} {...BODY} d={d} />
      ))}
    </g>
  );
}

export function Rug() {
  return (
    <g>
      <ellipse {...BODY} cx={0} cy={-14} rx={300} ry={30} />
      <ellipse {...SOFT} cx={0} cy={-14} rx={262} ry={22} />
    </g>
  );
}

export function Poster() {
  return (
    <g>
      <rect {...BODY} x={-46} y={-118} width={92} height={118} rx={4} />
      <path {...SOFT} d="M -32 -22 L -8 -62 L 10 -38 L 24 -56 L 34 -22 Z" />
      <circle {...SOFT} cx={22} cy={-88} r={10} />
    </g>
  );
}

export function Shelf() {
  return (
    <g>
      <rect {...BODY} x={-78} y={-9} width={156} height={9} rx={3} />
      {[[-58, 40], [-44, 52], [-32, 34]].map(([x, h], i) => (
        <rect key={i} {...BODY} x={x} y={-9 - h} width={11} height={h} rx={2} />
      ))}
      <ellipse {...BODY} cx={34} cy={-22} rx={20} ry={14} />
    </g>
  );
}

export function Whiteboard() {
  return (
    <g>
      <rect {...BODY} x={-108} y={-152} width={216} height={152} rx={6} />
      <path {...SOFT} d="M -78 -108 L -34 -108 M -78 -84 L -12 -84 M -78 -60 L -50 -60" />
      <path {...SOFT} d="M 16 -116 L 76 -116 L 76 -62 L 16 -62 Z" />
      <path {...SOFT} d="M 16 -62 L 46 -34 L 76 -62" />
    </g>
  );
}

export function Surfboard() {
  return (
    <g transform="rotate(-14)">
      <path
        {...BODY}
        d="M 0 0 Q -30 -60 -22 -140 Q -16 -206 0 -222 Q 16 -206 22 -140 Q 30 -60 0 0 Z"
      />
      <line {...SOFT} x1={0} y1={-30} x2={0} y2={-196} />
    </g>
  );
}

export function CoffeeMachine() {
  return (
    <g>
      <rect {...BODY} x={-32} y={-78} width={64} height={78} rx={8} />
      <rect {...SCREEN} x={-20} y={-68} width={40} height={20} rx={4} />
      <rect {...BODY} x={-16} y={-30} width={32} height={4} rx={2} />
      <path {...BODY} d="M -12 -26 L 12 -26 L 9 -8 L -9 -8 Z" />
      <path {...SOFT} d="M -7 -82 Q -2 -92 -7 -100 M 7 -82 Q 12 -92 7 -100" />
    </g>
  );
}

export function SideTable() {
  return (
    <g>
      <rect {...BODY} x={-58} y={-96} width={116} height={11} rx={4} />
      {[-44, 44].map((x) => (
        <line key={x} {...S} x1={x} y1={-85} x2={x} y2={0} />
      ))}
      <line {...SOFT} x1={-44} y1={-38} x2={44} y2={-38} />
    </g>
  );
}

export function Purifier() {
  return (
    <g>
      <rect {...BODY} x={-34} y={-124} width={68} height={124} rx={20} />
      {[-96, -84, -72, -60].map((y) => (
        <line key={y} {...SOFT} x1={-20} y1={y} x2={20} y2={y} />
      ))}
      <circle {...SCREEN} cx={0} cy={-32} r={11} />
    </g>
  );
}

export function Starlink() {
  return (
    <g>
      <ellipse {...BODY} cx={0} cy={-6} rx={34} ry={9} />
      <line {...S} x1={0} y1={-10} x2={-6} y2={-72} />
      <g transform="rotate(-18)">
        <rect {...BODY} x={-46} y={-116} width={92} height={62} rx={12} />
        <line {...SOFT} x1={-30} y1={-86} x2={30} y2={-86} />
      </g>
    </g>
  );
}

export function Speaker() {
  return (
    <g>
      <rect {...BODY} x={-52} y={-70} width={104} height={70} rx={7} />
      <rect {...SCREEN} x={-42} y={-60} width={84} height={40} rx={4} />
      {[-30, 0, 30].map((x) => (
        <circle key={x} {...SOFT} cx={x} cy={-13} r={5} />
      ))}
    </g>
  );
}

export function Projector() {
  return (
    <g>
      <rect {...BODY} x={-38} y={-40} width={76} height={40} rx={8} />
      <circle {...SCREEN} cx={-16} cy={-20} r={11} />
      <path fill="var(--glow)" stroke="none" opacity={0.35} d="M -26 -26 L -80 -60 L -80 12 L -26 -12 Z" />
    </g>
  );
}

export function WalkPad() {
  return (
    <g>
      <rect {...BODY} x={-118} y={-20} width={236} height={20} rx={8} />
      <rect {...SCREEN} x={-96} y={-15} width={192} height={10} rx={5} />
      <rect {...BODY} x={78} y={-34} width={30} height={14} rx={4} />
    </g>
  );
}

export function SpinBike() {
  return (
    <g>
      <path {...S} d="M -56 0 L -34 -10 L 34 -10 L 56 0" />
      <line {...S} x1={-30} y1={-10} x2={-6} y2={-96} />
      <line {...S} x1={30} y1={-10} x2={16} y2={-118} />
      <circle {...BODY} cx={-24} cy={-46} r={22} />
      <path {...BODY} d="M -22 -96 L 14 -96 L 18 -110 L -18 -110 Z" />
      <line {...S} x1={0} y1={-118} x2={34} y2={-118} />
      <path {...S} d="M 16 -118 L 16 -132 L 40 -132" />
    </g>
  );
}

export function Console() {
  return (
    <g>
      <rect {...BODY} x={-19} y={-104} width={38} height={104} rx={9} />
      <line {...SOFT} x1={0} y1={-92} x2={0} y2={-16} />
      <rect {...BODY} x={26} y={-22} width={44} height={22} rx={10} />
      <circle {...SOFT} cx={38} cy={-11} r={3.5} />
      <circle {...SOFT} cx={58} cy={-11} r={3.5} />
    </g>
  );
}

export function PadelRacket() {
  return (
    <g transform="rotate(12)">
      <path {...BODY} d="M -28 -74 Q -28 -122 0 -122 Q 28 -122 28 -74 Q 28 -46 0 -46 Q -28 -46 -28 -74 Z" />
      {[-13, 0, 13].map((x) =>
        [-92, -74, -56].map((y) => <circle key={`${x}:${y}`} {...SOFT} cx={x} cy={y} r={3.4} />),
      )}
      <path {...BODY} d="M -6 -48 L 6 -48 L 7 -12 L -7 -12 Z" />
      <rect {...BODY} x={-9} y={-14} width={18} height={14} rx={6} />
    </g>
  );
}

export function MassageGun() {
  return (
    <g>
      <rect {...BODY} x={-12} y={-48} width={24} height={48} rx={8} />
      <rect {...BODY} x={-6} y={-74} width={12} height={28} rx={4} />
      <circle {...BODY} cx={0} cy={-82} r={11} />
    </g>
  );
}

export function FloorLamp() {
  return (
    <g>
      <ellipse {...BODY} cx={0} cy={-6} rx={26} ry={8} />
      <rect {...BODY} x={-7} y={-224} width={14} height={218} rx={7} />
      <rect fill="var(--glow)" stroke="none" opacity={0.5} x={-4} y={-216} width={8} height={200} rx={4} />
    </g>
  );
}

/* --------------------------------------------------------------- lookup -- */

export const FLOOR_ART: Record<string, () => ReactElement> = {
  purifier: Purifier,
  starlink: Starlink,
  speaker: Speaker,
  bike: SpinBike,
  console: Console,
  padel: PadelRacket,
  massage: MassageGun,
  "floor-lamp": FloorLamp,
};

/** How tall each floor piece stands — the scene fits itself around these. */
export const FLOOR_HEIGHT: Record<string, number> = {
  purifier: 124,
  starlink: 130,
  speaker: 70,
  bike: 132,
  console: 104,
  padel: 116,
  massage: 94,
  "floor-lamp": 224,
};

/** Footprint used to pack floor items either side of the desk without overlap. */
export const FLOOR_WIDTH: Record<string, number> = {
  purifier: 88,
  starlink: 96,
  speaker: 116,
  bike: 128,
  console: 96,
  padel: 84,
  massage: 44,
  "floor-lamp": 60,
};
