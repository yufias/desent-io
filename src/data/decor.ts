// Styling touches, not Monis rental products — they cost nothing and exist purely
// so the room feels like somewhere you'd actually want to sit.

export type Decor = { id: string; name: string; art: string; hint: string };

export const DECOR: Decor[] = [
  { id: "plant",    name: "Monstera",      art: "plant",    hint: "The obligatory nomad plant" },
  { id: "rug",      name: "Woven rug",     art: "rug",      hint: "Softens the floor" },
  { id: "poster",   name: "Wall print",    art: "poster",   hint: "Something to look at" },
  { id: "shelf",    name: "Wall shelf",    art: "shelf",    hint: "Books and trinkets" },
  { id: "surfboard",name: "Surfboard",     art: "surfboard",hint: "You are in Bali, after all" },
];

export const DECOR_BY_ID = new Map(DECOR.map((d) => [d.id, d]));
