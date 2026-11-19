// Illustrative demonstration statistics for the public Impact page. Not real humanitarian data.

export const impactMetrics = [
  { label: "Requests submitted", value: "142", note: "+18 this month", tone: "green" },
  { label: "Requests approved", value: "98", note: "69% reviewed", tone: "blue" },
  { label: "Active pledges", value: "67", note: "Commitments, not deliveries", tone: "gold" },
  { label: "Confirmed deliveries", value: "41", note: "Beneficiary acknowledged", tone: "navy" },
];

export const impactSecondary = [
  { value: "KES 720K", label: "Confirmed M-Pesa donations", note: "Successful demo payments only" },
  { value: "KES 214K", label: "Pending financial pledges", note: "Not counted as received" },
  { value: "12", label: "Active collection centres", note: "Across 8 counties" },
  { value: "38", label: "Scheduled appointments", note: "Upcoming collection bookings" },
  { value: "286", label: "Resources awaiting delivery", note: "Allocated resource units" },
  { value: "41", label: "Confirmed deliveries", note: "Beneficiary receipt recorded" },
];

export const countyRequests = [
  { county: "Nairobi", count: 34 },
  { county: "Turkana", count: 28 },
  { county: "Garissa", count: 22 },
  { county: "Kisumu", count: 19 },
  { county: "Kitui", count: 14 },
];

// Delivered resource units by category (values double as bar widths, out of 100)
export const categoryOutput = [
  { name: "Education", value: 78 },
  { name: "Food security", value: 92 },
  { name: "Healthcare", value: 65 },
  { name: "Shelter", value: 48 },
  { name: "Community", value: 56 },
];

export const commitmentProgress = {
  coordinated: 67,
  received: 38,
  allocated: 29,
  pledgedOnly: 33,
};
