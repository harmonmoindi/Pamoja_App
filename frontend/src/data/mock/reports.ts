export type Priority = "Critical" | "High" | "Moderate";
export type ReportStatus = "Active" | "Monitoring" | "Resolved";

export interface SituationReport {
  id: string;
  county: string;
  category: string;
  title: string;
  description: string;
  priority: Priority;
  householdsAffected: number;
  status: ReportStatus;
}

// Fictional demonstration data; not verified humanitarian reports.
export const reports: SituationReport[] = [
  { id: "SIT001", county: "Nairobi", category: "Food Assistance", title: "Food Assistance Needs", description: "Sample report highlighting households requiring emergency food assistance.", priority: "Critical", householdsAffected: 120, status: "Active" },
  { id: "SIT002", county: "Kiambu", category: "Medical Assistance", title: "Medical Supplies Required", description: "Sample report highlighting demand for medical supplies.", priority: "High", householdsAffected: 85, status: "Active" },
  { id: "SIT003", county: "Machakos", category: "Clothing", title: "Clothing Assistance", description: "Sample report identifying clothing support requirements.", priority: "Moderate", householdsAffected: 60, status: "Active" },
  { id: "SIT004", county: "Kajiado", category: "Shelter", title: "Temporary Shelter Needs", description: "Sample report describing temporary shelter assistance requirements.", priority: "Critical", householdsAffected: 45, status: "Active" }
];