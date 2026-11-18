// The seven stages every need passes through, from identification to confirmed receipt.
export const lifecycle = [
  "Need identified",
  "Assessed",
  "Published",
  "Pledged",
  "Allocated",
  "Delivered",
  "Confirmed",
] as const;

export type LifecycleStage = (typeof lifecycle)[number];