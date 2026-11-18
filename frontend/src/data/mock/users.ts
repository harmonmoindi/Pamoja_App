import { User } from "@/types/user";

// Fictional demonstration accounts only.
export const users: User[] = [
  { id: "u-001", name: "Amina Hassan", email: "amina.hassan@example.org", role: "donor", status: "active", county: "Nairobi County", joinedOn: "2026-08-14", lastActiveOn: "2026-11-18" },
  { id: "u-002", name: "Peter Otieno", email: "peter.otieno@example.org", role: "donor", status: "active", county: "Kisumu County", joinedOn: "2026-09-03", lastActiveOn: "2026-11-17" },
  { id: "u-003", name: "Grace Wanjiku", email: "grace.wanjiku@example.org", role: "beneficiary", status: "active", county: "Nairobi County", joinedOn: "2026-09-21", lastActiveOn: "2026-11-16" },
  { id: "u-004", name: "Joseph Lokiru", email: "joseph.lokiru@example.org", role: "beneficiary", status: "active", county: "Turkana County", joinedOn: "2026-10-02", lastActiveOn: "2026-11-12" },
  { id: "u-005", name: "Halima Abdi", email: "halima.abdi@example.org", role: "beneficiary", status: "pending", county: "Garissa County", joinedOn: "2026-11-16", lastActiveOn: "2026-11-16" },
  { id: "u-006", name: "Faith Achieng", email: "faith.achieng@example.org", role: "agency", status: "active", county: "Kisumu County", joinedOn: "2026-09-02", lastActiveOn: "2026-11-18" },
  { id: "u-007", name: "Daniel Mutua", email: "daniel.mutua@example.org", role: "agency", status: "active", county: "Turkana County", joinedOn: "2026-08-21", lastActiveOn: "2026-11-17" },
  { id: "u-008", name: "Samuel Kiptoo", email: "samuel.kiptoo@example.org", role: "donor", status: "suspended", county: "Nairobi County", joinedOn: "2026-07-30", lastActiveOn: "2026-10-29" },
  { id: "u-009", name: "Mercy Njeri", email: "mercy.njeri@example.org", role: "agency", status: "pending", county: "Nairobi County", joinedOn: "2026-11-15", lastActiveOn: "2026-11-15" },
  { id: "u-010", name: "Pamoja Admin", email: "admin@example.org", role: "admin", status: "active", county: "Nairobi County", joinedOn: "2026-06-01", lastActiveOn: "2026-11-18" },
];
