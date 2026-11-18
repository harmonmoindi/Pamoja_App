import { DuplicatePair } from "@/types/admin";

// Similarity alone does not imply fraud: every pair needs a human decision.
export const duplicates: DuplicatePair[] = [
  {
    id: "dup-001",
    status: "needs-review",
    signals: ["Same category", "Nearby general area", "Submitted within 48 hours"],
    a: { reference: "PAM-REQ-1042", title: "Learning support materials", category: "Education", county: "Turkana County", submittedOn: "2026-11-12" },
    b: { reference: "PAM-REQ-1045", title: "Books for community class", category: "Education", county: "Turkana County", submittedOn: "2026-11-13" },
  },
  {
    id: "dup-002",
    status: "needs-review",
    signals: ["Same category", "Same general area"],
    a: { reference: "PAM-REQ-1031", title: "Medical supplies for clinic", category: "Healthcare", county: "Nairobi County", submittedOn: "2026-11-09" },
    b: { reference: "PAM-REQ-1038", title: "Clinic medicine stock", category: "Healthcare", county: "Nairobi County", submittedOn: "2026-11-11" },
  },
  {
    id: "dup-003",
    status: "separate",
    signals: ["Same category", "Submitted within 48 hours"],
    a: { reference: "PAM-REQ-1019", title: "Water storage containers", category: "Food Security", county: "Marsabit County", submittedOn: "2026-11-05" },
    b: { reference: "PAM-REQ-1021", title: "Food packages for households", category: "Food Security", county: "Garissa County", submittedOn: "2026-11-06" },
  },
];
