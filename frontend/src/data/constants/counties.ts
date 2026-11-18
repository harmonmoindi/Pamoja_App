// Starter list taken from the prototype's demo data. Extend as the project grows.
export const counties = [
  "Garissa County",
  "Kisumu County",
  "Kitui County",
  "Marsabit County",
  "Nairobi County",
  "Turkana County",
] as const;

export type County = (typeof counties)[number];