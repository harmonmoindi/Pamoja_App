// Starter list taken from the prototype's demo data. Add new categories only after telling the team.
export const categories = [
  "Community Support",
  "Education",
  "Food Security",
  "Healthcare",
  "Shelter",
] as const;

export type Category = (typeof categories)[number];

export const urgencyLevels = ["Urgent", "High priority"] as const;