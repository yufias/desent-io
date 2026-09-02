"use client";

import { BY_ID } from "@/data/catalog";
import type { Build, Product } from "@/lib/types";
import {
  BoomArm,
  Chair,
  CoffeeMachine,
  DeskElectric,
  DeskWood,
  DeskLamp,
  FLOOR_ART,
  FLOOR_HEIGHT,
  FLOOR_WIDTH,
  Hub,
  Keyboard,
  Laptop,
  LaptopStand,
  LightBar,
  MicOnBoom,
  MiniPC,
  Monitor,
  Mouse,
  Plant,
  Poster,
  PowerStrip,
  Projector,
  Rug,
  Shelf,
  SideTable,
  Surfboard,
  WalkPad,
  Webcam,
  Whiteboard,
  monitorHeight,
} from "./art";

const VIEW_W = 1000;
const VIEW_H = 520;
const FLOOR_Y = 470;
const CENTER = 500;
const DESK_H_SIT = 190;
const DESK_H_STAND = 262;
const MON_GAP = 14;
const MAX_DESK_W = 700;
const CHAIR_SCALE = 0.82;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A coffee machine reads as a coffee machine only when it's standing on something. */
function CoffeeStation() {
  return (
    <g>
      <SideTable />
      <g transform="translate(0,-96)">
        <CoffeeMachine />
      </g>
    </g>
  );
}

function ProjectorStand() {
  return (
    <g>
      <SideTable />
      <g transform="translate(0,-96)">
        <Projector />
      </g>
    </g>
  );
}

const SPECIAL_FLOOR: Record<string, { node: () => React.ReactElement; width: number; height: number }> = {
  coffee: { node: CoffeeStation, width: 124, height: 186 },
  projector: { node: ProjectorStand, width: 124, height: 140 },
  plant: { node: Plant, width: 68, height: 112 },
};

export default function WorkspaceScene({ build }: { build: Build }) {
  const desk = BY_ID.get(build.deskId);
  const chair = BY_ID.get(build.chairId);
  const monitors = build.monitorIds.map((id) => BY_ID.get(id)).filter((p) => p !== undefined);
  const computer = build.computerId ? BY_ID.get(build.computerId) : undefined;
  const decor = new Set(build.decorIds);

  const hasArt = (art: string) =>
    build.addonIds.some((id) => BY_ID.get(id)?.art === art);

  const deskH = build.standing && desk?.standing ? DESK_H_STAND : DESK_H_SIT;
  const deskTopY = FLOOR_Y - deskH;

  /* -- desk surface budget -- */
  const hasLamp = hasArt("desk-lamp");
  const isLaptop = computer?.art === "laptop";
  const hasMic = hasArt("mic") || hasArt("boom");
  const hasMiniPC = computer?.art === "minipc";

  const reserveL = (hasLamp ? 64 : 0) + (isLaptop ? 132 : 0);
  const reserveR = (hasMic ? 64 : 0) + (hasMiniPC ? 76 : 0);

  const rawTotal =
    monitors.reduce((sum, m) => sum + (m.screenW ?? 160), 0) + MON_GAP * Math.max(0, monitors.length - 1);

  // Monis sells the desk in three sizes, so a bigger setup simply gets a bigger desk
  // rather than shrinking the screens into toys.
  const deskWidth = clamp(36 + reserveL + reserveR + rawTotal, desk?.deskWidth ?? 500, MAX_DESK_W);
  const hw = deskWidth / 2;

  let lx = -hw + 18;
  let lampX = 0;
  let laptopX = 0;
  if (hasLamp) { lampX = lx + 30; lx += 64; }
  if (isLaptop) { laptopX = lx + 64; lx += 132; }

  let rx = hw - 18;
  let micX = 0;
  let pcX = 0;
  if (hasMic) { micX = rx - 30; rx -= 64; }
  if (hasMiniPC) { pcX = rx - 38; rx -= 76; }

  const monBudget = Math.max(120, rx - lx);
  const monScale = monitors.length ? Math.min(1, monBudget / rawTotal) : 1;

  // Centred on the desk when there's room; nudged only as far as the reserved edges demand.
  const monHalf = (rawTotal * monScale) / 2;
  const monCenter = clamp(0, lx + monHalf, Math.max(lx + monHalf, rx - monHalf));

  // Lay the screens out side by side, centred in the space the edges left over.
  const placed: { product: Product; x: number; w: number; h: number }[] = [];
  let cursor = monCenter - (rawTotal * monScale) / 2;
  for (const m of monitors) {
    const w = (m.screenW ?? 160) * monScale;
    placed.push({ product: m, x: cursor + w / 2, w, h: (m.screenH ?? 100) * monScale });
    cursor += w + MON_GAP * monScale;
  }

  // Anything that perches on a screen goes on whichever one is nearest the middle.
  const hero = placed.length
    ? placed.reduce((best, p) => (Math.abs(p.x - monCenter) < Math.abs(best.x - monCenter) ? p : best))
    : null;
  const heroTopY = hero ? deskTopY - monitorHeight(hero.h / monScale) * monScale : 0;

  /* ------------------------------------------- floor items, packed outward -- */
  const floorKeys: string[] = [];
  if (decor.has("plant")) floorKeys.push("plant");
  for (const id of build.addonIds) {
    const art = BY_ID.get(id)?.art;
    if (!art) continue;
    if (FLOOR_ART[art] || SPECIAL_FLOOR[art]) floorKeys.push(art);
  }

  const left: string[] = [];
  const right: string[] = [];
  floorKeys.forEach((k, i) => (i % 2 === 0 ? left : right).push(k));

  const layCluster = (keys: string[], dir: -1 | 1) => {
    const items: { key: string; x: number }[] = [];
    let cur = 0;
    for (const key of keys) {
      const w = SPECIAL_FLOOR[key]?.width ?? FLOOR_WIDTH[key] ?? 80;
      items.push({ key, x: cur + dir * (w / 2) });
      cur += dir * (w + 18);
    }
    return { items, extent: Math.abs(cur) };
  };

  const leftCluster = layCluster(left, -1);
  const rightCluster = layCluster(right, 1);
  const leftAnchor = CENTER - hw - 26;
  const rightAnchor = CENTER + hw + 26;

  // Hung clear of the desk surface, just outside whichever width the desk ended up.
  const wallBottom = Math.min(deskTopY - 26, FLOOR_Y - 210);
  const boardX = CENTER - hw - 128;
  const wallRightX = CENTER + hw + 96;
  const shelfBottom = Math.min(wallBottom + 92, deskTopY - 8);

  const clusterHeight = (keys: string[]) =>
    keys.reduce((m, k) => Math.max(m, SPECIAL_FLOOR[k]?.height ?? FLOOR_HEIGHT[k] ?? 90), 0);

  /* ---- work out how much room the whole composition actually needs ---- */
  const chairH =
    (168 + (chair?.back === "low" ? 86 : chair?.back === "high" ? 152 : 122) + (chair?.headrest ? 42 : 0)) *
    CHAIR_SCALE;

  const bounds = {
    left: Math.min(CENTER - hw, leftAnchor - leftCluster.extent),
    right: Math.max(CENTER + hw, rightAnchor + rightCluster.extent),
    top: Math.min(
      deskTopY,
      FLOOR_Y - chairH,
      FLOOR_Y - clusterHeight(left),
      FLOOR_Y - clusterHeight(right),
      ...placed.map((m) => deskTopY - monitorHeight(m.h / monScale) * monScale),
    ),
  };
  if (hasArt("whiteboard")) {
    bounds.left = Math.min(bounds.left, boardX - 108);
    bounds.top = Math.min(bounds.top, wallBottom - 152);
  }
  if (decor.has("poster")) {
    bounds.right = Math.max(bounds.right, wallRightX + 46);
    bounds.top = Math.min(bounds.top, wallBottom - 118);
  }
  if (decor.has("shelf")) bounds.right = Math.max(bounds.right, wallRightX + 78);
  if (decor.has("surfboard")) { bounds.left = Math.min(bounds.left, 24); bounds.top = Math.min(bounds.top, FLOOR_Y - 230); }
  if (decor.has("rug")) {
    bounds.left = Math.min(bounds.left, CENTER - 300);
    bounds.right = Math.max(bounds.right, CENTER + 300);
  }

  // Scale about the floor so the room never floats, and re-centre what's left.
  const contentW = Math.max(1, bounds.right - bounds.left);
  const contentH = Math.max(1, FLOOR_Y - bounds.top);
  const fit = Math.min(1, (VIEW_W - 36) / contentW, (FLOOR_Y - 18) / contentH);
  const contentCx = (bounds.left + bounds.right) / 2;
  const fitTransform = `translate(${CENTER - contentCx * fit}, ${FLOOR_Y * (1 - fit)}) scale(${fit})`;

  const renderFloor = (key: string) => {
    const Special = SPECIAL_FLOOR[key]?.node;
    if (Special) return <Special />;
    const Art = FLOOR_ART[key];
    return Art ? <Art /> : null;
  };

  /* ------------------------------------------------------------- render -- */
  const kbX = clamp(monCenter, -hw + 92, hw - 92) + CENTER;
  const mouseX = clamp(monCenter + 112, -hw + 40, hw - 34) + CENTER;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-full w-full"
      role="img"
      aria-label="Live preview of the workspace you are designing"
    >
      {/* room */}
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="var(--stage)" />
      <line
        x1={0}
        y1={FLOOR_Y}
        x2={VIEW_W}
        y2={FLOOR_Y}
        stroke="var(--ink-soft)"
        strokeWidth={2}
      />

      {/* Everything below is framed as one composition, so no combination falls off-stage. */}
      <g className="scene-move" transform={fitTransform}>

      {decor.has("rug") && (
        <g transform={`translate(${CENTER}, ${FLOOR_Y + 26})`}>
          <Rug />
        </g>
      )}

      {/* wall */}
      {hasArt("whiteboard") && (
        <g className="scene-move" transform={`translate(${boardX}, ${wallBottom})`}>
          <Whiteboard />
        </g>
      )}
      {decor.has("poster") && (
        <g className="scene-move" transform={`translate(${wallRightX}, ${wallBottom})`}>
          <Poster />
        </g>
      )}
      {decor.has("shelf") && (
        <g className="scene-move" transform={`translate(${wallRightX}, ${shelfBottom})`}>
          <Shelf />
        </g>
      )}
      {decor.has("surfboard") && (
        <g transform={`translate(64, ${FLOOR_Y})`}>
          <Surfboard />
        </g>
      )}

      {/* floor clusters, behind the desk */}
      <g transform={`translate(${leftAnchor}, ${FLOOR_Y})`}>
        {leftCluster.items.map(({ key, x }) => (
          <g key={key} transform={`translate(${x}, 0)`}>
            {renderFloor(key)}
          </g>
        ))}
      </g>
      <g transform={`translate(${rightAnchor}, ${FLOOR_Y})`}>
        {rightCluster.items.map(({ key, x }) => (
          <g key={key} transform={`translate(${x}, 0)`}>
            {renderFloor(key)}
          </g>
        ))}
      </g>

      {hasArt("walkpad") && (
        <g transform={`translate(${CENTER}, ${FLOOR_Y})`}>
          <WalkPad />
        </g>
      )}
      {hasArt("powerstrip") && (
        <g transform={`translate(${CENTER - hw + 40}, ${FLOOR_Y})`}>
          <PowerStrip />
        </g>
      )}

      {/* desk + everything standing on it moves together when it rises */}
      <g className="scene-move" transform={`translate(${CENTER}, ${FLOOR_Y})`}>
        {desk?.art === "desk-wood" ? (
          <DeskWood width={deskWidth} height={deskH} />
        ) : (
          <DeskElectric width={deskWidth} height={deskH} />
        )}
      </g>

      <g className="scene-move" transform={`translate(${CENTER}, ${deskTopY})`}>
        {hasLamp && (
          <g transform={`translate(${lampX}, 0)`}>
            <DeskLamp />
          </g>
        )}
        {isLaptop && (
          <g transform={`translate(${laptopX}, 0)`}>
            {hasArt("stand") ? (
              <>
                <LaptopStand />
                <g transform="translate(8,-34)">
                  <Laptop />
                </g>
              </>
            ) : (
              <Laptop />
            )}
          </g>
        )}
        {hasMic && (
          <g transform={`translate(${micX}, 0) scale(-1,1)`}>
            {hasArt("mic") ? <MicOnBoom /> : <BoomArm />}
          </g>
        )}
        {hasArt("hub") && (
          <g transform={`translate(${clamp(monCenter - 150, -hw + 30, hw - 30)}, 0)`}>
            <Hub />
          </g>
        )}
      </g>

      {/* screens */}
      {placed.map((p, i) => (
        <g
          key={`${p.product.id}-${i}`}
          className="scene-move"
          transform={`translate(${CENTER + p.x}, ${deskTopY}) scale(${monScale})`}
        >
          <Monitor
            w={p.product.screenW ?? 160}
            h={p.product.screenH ?? 100}
            curved={p.product.art === "monitor-curved"}
          />
        </g>
      ))}

      {hero && hasArt("light-bar") && (
        <g className="scene-move" transform={`translate(${CENTER + hero.x}, ${heroTopY + 4})`}>
          <LightBar />
        </g>
      )}
      {hero && hasArt("webcam") && (
        <g className="scene-move" transform={`translate(${CENTER + hero.x}, ${heroTopY})`}>
          <Webcam />
        </g>
      )}

      {/* front of the desk */}
      <g className="scene-move" transform={`translate(0, ${deskTopY})`}>
        {hasArt("keyboard") && (
          <g transform={`translate(${kbX}, 2)`}>
            <Keyboard />
          </g>
        )}
        {hasArt("mouse") && (
          <g transform={`translate(${mouseX}, 2)`}>
            <Mouse />
          </g>
        )}
        {hasMiniPC && (
          <g transform={`translate(${CENTER + pcX}, 0)`}>
            <MiniPC />
          </g>
        )}
      </g>

      {/* the chair rolls aside when you stand up */}
      <g
        className="scene-move"
        transform={
          build.standing && desk?.standing
            ? `translate(${CENTER + hw * 0.68}, ${FLOOR_Y}) scale(0.78)`
            : `translate(${CENTER}, ${FLOOR_Y}) scale(0.82)`
        }
        opacity={build.standing && desk?.standing ? 0.92 : 1}
      >
        <Chair
          back={chair?.back ?? "mid"}
          headrest={chair?.headrest ?? false}
          mesh={chair?.art === "chair-mesh"}
        />
      </g>

      </g>
    </svg>
  );
}
