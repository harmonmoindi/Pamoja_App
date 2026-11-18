import { Agency, ChecklistItem } from "@/types/admin";

const checklist = (done: boolean[]): ChecklistItem[] =>
  [
    "Organization profile completed",
    "Registration details supplied",
    "Operating region documented",
    "Safeguarding contact supplied",
  ].map((label, i) => ({ label, done: done[i] ?? false }));

// Fictional demonstration organizations only.
export const agencies: Agency[] = [
  {
    id: "ag-001",
    name: "Community Health Access Kenya",
    categories: ["Healthcare"],
    counties: ["Nairobi County", "Kiambu County"],
    status: "pending",
    submittedOn: "2026-11-15",
    checklist: checklist([true, true, true, false]),
  },
  {
    id: "ag-002",
    name: "Northern Learning Initiative",
    categories: ["Education", "Community Support"],
    counties: ["Turkana County", "Marsabit County"],
    status: "pending",
    submittedOn: "2026-11-13",
    checklist: checklist([true, true, false, false]),
  },
  {
    id: "ag-003",
    name: "Lake Region Relief Network",
    categories: ["Shelter", "Food Security"],
    counties: ["Kisumu County", "Homa Bay County"],
    status: "re-review",
    submittedOn: "2026-11-10",
    updatedOn: "2026-11-17",
    note: "Information updated",
    checklist: checklist([true, true, true, true]),
  },
  {
    id: "ag-004",
    name: "Kitui Health Outreach",
    categories: ["Healthcare"],
    counties: ["Kitui County"],
    status: "more-info",
    submittedOn: "2026-11-06",
    note: "Awaiting safeguarding contact",
    checklist: checklist([true, true, true, false]),
  },
  {
    id: "ag-005",
    name: "Pamoja Demo Education Partner",
    categories: ["Education"],
    counties: ["Turkana County"],
    status: "verified",
    submittedOn: "2026-08-21",
    checklist: checklist([true, true, true, true]),
  },
  {
    id: "ag-006",
    name: "Pamoja Demo Resilience Partner",
    categories: ["Food Security", "Shelter"],
    counties: ["Marsabit County", "Garissa County"],
    status: "verified",
    submittedOn: "2026-09-02",
    checklist: checklist([true, true, true, true]),
  },
  {
    id: "ag-007",
    name: "Garissa Community Support Trust",
    categories: ["Community Support", "Food Security"],
    counties: ["Garissa County"],
    status: "verified",
    submittedOn: "2026-09-19",
    checklist: checklist([true, true, true, true]),
  },
];
