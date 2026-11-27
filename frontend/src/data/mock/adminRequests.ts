import { OversightRequest } from "@/types/admin";

// Kept for local demos only. Admin Request Oversight loads live API data.
export const adminRequests: OversightRequest[] = [
  { id: 1, reference: "PAM-REQ-1045", title: "Books for community class", category: "Education", county: "Turkana County", agency: "Pamoja Demo Education Partner", stage: "Assessed", priority: "Standard", updatedOn: "2026-11-17" },
  { id: 2, reference: "PAM-REQ-1042", title: "Learning support materials", category: "Education", county: "Turkana County", agency: "Pamoja Demo Education Partner", stage: "Published", priority: "High priority", updatedOn: "2026-11-18" },
  { id: 3, reference: "PAM-REQ-1038", title: "Clinic medicine stock", category: "Healthcare", county: "Nairobi County", agency: "Community Health Access Kenya", stage: "Need identified", priority: "Urgent", updatedOn: "2026-11-11" },
  { id: 4, reference: "PAM-REQ-1031", title: "Medical supplies for clinic", category: "Healthcare", county: "Nairobi County", agency: "Community Health Access Kenya", stage: "Assessed", priority: "Urgent", updatedOn: "2026-11-10" },
  { id: 5, reference: "PAM-REQ-1025", title: "Medical kits for outreach", category: "Healthcare", county: "Kitui County", agency: "Kitui Health Outreach", stage: "Delivered", priority: "High priority", updatedOn: "2026-11-18" },
  { id: 6, reference: "PAM-REQ-1021", title: "Food packages for households", category: "Food Security", county: "Garissa County", agency: "Garissa Community Support Trust", stage: "Pledged", priority: "High priority", updatedOn: "2026-11-14" },
  { id: 7, reference: "PAM-REQ-1019", title: "Water storage containers", category: "Food Security", county: "Marsabit County", agency: "Pamoja Demo Resilience Partner", stage: "Allocated", priority: "Standard", updatedOn: "2026-11-13" },
  { id: 8, reference: "PAM-REQ-1012", title: "Shelter kits after flooding", category: "Shelter", county: "Kisumu County", agency: "Lake Region Relief Network", stage: "Confirmed", priority: "Urgent", updatedOn: "2026-11-08" },
];
