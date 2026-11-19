import { AuditEvent } from "@/types/admin";

// Newest first. Fictional demonstration events only.
export const auditEvents: AuditEvent[] = [
  { id: "ev-001", kind: "delivery", title: "Resource receipt recorded", description: "40 medical kits received for PAM-REQ-1025", actor: "Faith Achieng", timestamp: "2026-11-18T08:48:00" },
  { id: "ev-002", kind: "request", title: "Request approved", description: "Learning support request approved by J. Mutua", actor: "Daniel Mutua", timestamp: "2026-11-18T07:55:00" },
  { id: "ev-003", kind: "delivery", title: "Delivery confirmed", description: "Beneficiary confirmed complete receipt for DEL-0892", actor: "Joseph Lokiru", timestamp: "2026-11-18T05:50:00" },
  { id: "ev-004", kind: "pledge", title: "New donor pledge", description: "200 exercise books committed to Turkana schools", actor: "Amina Hassan", timestamp: "2026-11-17T16:20:00" },
  { id: "ev-005", kind: "agency", title: "Agency information updated", description: "Lake Region Relief Network resubmitted details for re-review", actor: "Lake Region Relief Network", timestamp: "2026-11-17T11:05:00" },
  { id: "ev-006", kind: "safety", title: "Possible duplicate flagged", description: "PAM-REQ-1042 and PAM-REQ-1045 share three signals", actor: "System", timestamp: "2026-11-16T14:30:00" },
  { id: "ev-007", kind: "user", title: "Account suspended", description: "Donor account suspended pending review", actor: "Pamoja Admin", timestamp: "2026-10-29T09:10:00" },
  { id: "ev-008", kind: "agency", title: "Agency verified", description: "Garissa Community Support Trust approved", actor: "Pamoja Admin", timestamp: "2026-09-19T13:40:00" },
];
