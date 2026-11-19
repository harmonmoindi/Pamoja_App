import { AdminMetric } from "@/types/admin";

// Headline numbers for the admin dashboard (platform-wide demo totals).
export const adminMetrics: AdminMetric[] = [
  { label: "Registered users", value: "2,418", note: "+84 this month" },
  { label: "Pending agencies", value: "12", note: "Awaiting review" },
  { label: "Verified agencies", value: "48", note: "Across 19 counties" },
  { label: "Flagged records", value: "7", note: "Require assessment" },
];

export const trustSafety = {
  score: 94,
  headline: "Platform health is stable",
  summary: "7 flagged records require human review.",
};
