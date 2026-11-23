export type BeneficiaryStatus = "under review" | "approved" | "fulfilled";

export type BeneficiaryRequest = {
  reference: string;
  title: string;
  category: string;
  location: string;
  status: BeneficiaryStatus;
  summary: string;
  resource: string;
  quantity: number;
  urgency: "Low" | "Medium" | "High";
  submittedOn: string;
};

export type AssistanceStep = {
  title: string;
  detail: string;
  done: boolean;
  body: string;
};

export type TrackingStep = {
  title: string;
  detail: string;
  done: boolean;
};

// Matches the concept-prototype screens: six approved demonstration requests.
export const seedBeneficiaryRequests: BeneficiaryRequest[] = [
  {
    reference: "REQ-1006",
    title: "Community garden starter packs",
    category: "Community Development",
    location: "Nakuru",
    status: "approved",
    summary: "Seedlings, hand tools, and soil for a fictional community garden in Nakuru.",
    resource: "Garden starter kits",
    quantity: 40,
    urgency: "Medium",
    submittedOn: "18 Nov 2026",
  },
  {
    reference: "REQ-1005",
    title: "Learning materials for rural schools",
    category: "Education",
    location: "Kitui",
    status: "approved",
    summary: "Exercise books and classroom kits for a fictional school request in Kitui.",
    resource: "Learning kits",
    quantity: 120,
    urgency: "Medium",
    submittedOn: "16 Nov 2026",
  },
  {
    reference: "REQ-1004",
    title: "Emergency shelter support in Kisumu",
    category: "Shelter",
    location: "Kisumu",
    status: "approved",
    summary: "Temporary shelter materials recorded for a fictional response in Kisumu.",
    resource: "Shelter kits",
    quantity: 25,
    urgency: "High",
    submittedOn: "14 Nov 2026",
  },
  {
    reference: "REQ-1003",
    title: "Medical supplies for community outreach",
    category: "Healthcare",
    location: "Nairobi",
    status: "approved",
    summary: "Basic clinic supplies for a fictional community outreach day in Nairobi.",
    resource: "Medical kits",
    quantity: 60,
    urgency: "High",
    submittedOn: "12 Nov 2026",
  },
  {
    reference: "REQ-1002",
    title: "Food assistance for vulnerable households",
    category: "Food Security",
    location: "Garissa",
    status: "approved",
    summary: "Household food packages for a fictional request in Garissa.",
    resource: "Food parcels",
    quantity: 80,
    urgency: "High",
    submittedOn: "9 Nov 2026",
  },
  {
    reference: "REQ-1001",
    title: "School supplies for students in Turkana",
    category: "Education",
    location: "Turkana",
    status: "approved",
    summary: "Help a community learning centre prepare 50 students for the new term with essential school materials.",
    resource: "Exercise books",
    quantity: 500,
    urgency: "High",
    submittedOn: "6 Nov 2026",
  },
];

export const assistanceProcess: AssistanceStep[] = [
  {
    title: "Submit request",
    detail: "Completed in fictional scenario",
    done: true,
    body: "A beneficiary describes the support needed. In this demonstration, that step is already complete.",
  },
  {
    title: "Agency review",
    detail: "Completed in fictional scenario",
    done: true,
    body: "A participating organization reviews the request. In this demonstration, that review is already recorded.",
  },
  {
    title: "Approval decision",
    detail: "Not yet completed",
    done: false,
    body: "The organization records whether support can proceed. This step is still open in the demonstration scenario.",
  },
  {
    title: "Support coordination",
    detail: "Not yet completed",
    done: false,
    body: "Resources are matched and a handover is arranged. Nothing has been coordinated in this scenario yet.",
  },
  {
    title: "Delivery confirmation",
    detail: "Not yet completed",
    done: false,
    body: "The beneficiary confirms that support arrived. No delivery has been confirmed in this scenario yet.",
  },
];

export const trackingJourney: TrackingStep[] = [
  { title: "Request submitted", detail: "Completed in fictional scenario", done: true },
  { title: "Agency review started", detail: "Completed in fictional scenario", done: true },
  { title: "Assessment decision", detail: "Completed in fictional scenario", done: true },
  { title: "Approved for discovery", detail: "Completed in fictional scenario", done: true },
  { title: "Donor pledge recorded", detail: "Not yet completed", done: false },
  { title: "Resources coordinated", detail: "Not yet completed", done: false },
  { title: "Delivery confirmed", detail: "Not yet completed", done: false },
];

export const requestCategories = [
  "Education",
  "Food Security",
  "Healthcare",
  "Shelter",
  "Community Development",
  "Community Support",
] as const;

export const requestUrgencies = ["Low", "Medium", "High"] as const;

export const deliveryOutcomes = [
  "Yes, everything was received",
  "Partially received",
  "Not received",
  "Report a discrepancy",
] as const;

export function requestStats(requests: BeneficiaryRequest[]) {
  return {
    total: requests.length,
    underReview: requests.filter((request) => request.status === "under review").length,
    approved: requests.filter((request) => request.status === "approved").length,
    fulfilled: requests.filter((request) => request.status === "fulfilled").length,
  };
}

export function nextReference(requests: BeneficiaryRequest[]) {
  const max = requests.reduce((highest, request) => {
    const value = Number(request.reference.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 1000);
  return `REQ-${max + 1}`;
}

export function deliveryLabel(request: BeneficiaryRequest, index: number) {
  return `DEL-${String(index + 1).padStart(3, "0")} · ${request.resource}`;
}

export function trackingStepsFor(status: BeneficiaryStatus): TrackingStep[] {
  if (status === "fulfilled") {
    return trackingJourney.map((step) => ({ ...step, done: true, detail: "Completed in fictional scenario" }));
  }
  if (status === "under review") {
    return trackingJourney.map((step, index) => ({
      ...step,
      done: index < 2,
      detail: index < 2 ? "Completed in fictional scenario" : "Not yet completed",
    }));
  }
  return trackingJourney;
}
