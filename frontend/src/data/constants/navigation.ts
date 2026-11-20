export type PortalRole = "donor" | "beneficiary" | "agency" | "admin";

// [label, path] pairs shown in each portal's sidebar.
export const roleNav: Record<PortalRole, [string, string][]> = {
  donor: [
    ["Overview", "/donor/dashboard"],
    ["Discover needs", "/explore"],
    ["Financial donations", "/donor/donations"],
    ["My pledges", "/donor/pledges"],
    ["My impact", "/impact"],
    ["Notifications", "/donor/notifications"],
    ["Preferences", "/donor/preferences"],
  ],
  beneficiary: [
    ["Dashboard", "/beneficiary/dashboard"],
    ["Request Assistance", "/beneficiary/request"],
    ["My Requests", "/beneficiary/requests"],
    ["Request Tracking", "/beneficiary/tracking"],
    ["Confirm Receipt", "/beneficiary/receipt"],
    ["Notifications", "/beneficiary/notifications"],
  ],
  agency: [
    ["Overview", "/agency/dashboard"],
    ["Assistance requests", "/agency/requests"],
    ["Needs assessment", "/agency/assessment"],
    ["Resource matching", "/agency/matching"],
    ["Inventory", "/agency/inventory"],
    ["Task management", "/agency/tasks"],
    ["Deliveries", "/agency/deliveries"],
    ["Collection centres", "/agency/centres"],
    ["Appointments", "/agency/appointments"],
    ["Impact reports", "/impact"],
  ],
  admin: [
    ["Overview", "/admin/dashboard"],
    ["Agency verification", "/admin/verification"],
    ["Users", "/admin/users"],
    ["Request oversight", "/admin/requests"],
    ["Duplicate review", "/admin/duplicates"],
    ["Audit activity", "/admin/audit"],
    ["Platform analytics", "/impact"],
  ],
};
