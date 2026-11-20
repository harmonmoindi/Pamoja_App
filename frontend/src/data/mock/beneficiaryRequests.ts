export type BeneficiaryStatus = "under review" | "approved" | "fulfilled";

export type BeneficiaryRequest = {
  reference: string;
  title: string;
  category: string;
  location: string;
  status: BeneficiaryStatus;
  summary: string;
  submittedOn: string;
};

export type AssistanceStep = {
  title: string;
  detail: string;
  done: boolean;
  body: string;
};

// Matches the concept-prototype dashboard: six approved demonstration requests,
// with the first four shown as the recent list.
export const seedBeneficiaryRequests: BeneficiaryRequest[] = [
  {
    reference: "REQ-1006",
    title: "Community garden starter packs",
    category: "Community Development",
    location: "Nakuru",
    status: "approved",
    summary: "Seedlings, hand tools, and soil for a fictional community garden in Nakuru.",
    submittedOn: "18 Nov 2026",
  },
  {
    reference: "REQ-1005",
    title: "Learning materials for rural schools",
    category: "Education",
    location: "Kitui",
    status: "approved",
    summary: "Exercise books and classroom kits for a fictional school request in Kitui.",
    submittedOn: "16 Nov 2026",
  },
  {
    reference: "REQ-1004",
    title: "Emergency shelter support in Kisumu",
    category: "Shelter",
    location: "Kisumu",
    status: "approved",
    summary: "Temporary shelter materials recorded for a fictional response in Kisumu.",
    submittedOn: "14 Nov 2026",
  },
  {
    reference: "REQ-1003",
    title: "Medical supplies for community outreach",
    category: "Healthcare",
    location: "Nairobi",
    status: "approved",
    summary: "Basic clinic supplies for a fictional community outreach day in Nairobi.",
    submittedOn: "12 Nov 2026",
  },
  {
    reference: "REQ-1002",
    title: "Clean water storage containers",
    category: "Food Security",
    location: "Garissa",
    status: "approved",
    summary: "Household water containers for a fictional request in Garissa.",
    submittedOn: "9 Nov 2026",
  },
  {
    reference: "REQ-1001",
    title: "Household food packages",
    category: "Food Security",
    location: "Turkana",
    status: "approved",
    summary: "Food parcels recorded for a fictional household request in Turkana.",
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

export const requestCategories = [
  "Community Development",
  "Education",
  "Shelter",
  "Healthcare",
  "Food Security",
  "Community Support",
] as const;

export const requestLocations = ["Nakuru", "Kitui", "Kisumu", "Nairobi", "Garissa", "Turkana", "Marsabit"] as const;

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
