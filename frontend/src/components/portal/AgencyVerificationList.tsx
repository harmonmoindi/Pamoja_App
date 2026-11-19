import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { Agency, VerificationStatus } from "@/types/admin";
import { formatDate } from "@/utils/format";

export const verificationLabel: Record<VerificationStatus, string> = {
  pending: "Pending",
  "re-review": "Re-review",
  "more-info": "More info needed",
  verified: "Verified",
};

export const verificationTone: Record<VerificationStatus, string> = {
  pending: "gold",
  "re-review": "blue",
  "more-info": "gold",
  verified: "green",
};

/** "Nairobi County", "Kiambu County" -> "Nairobi & Kiambu" */
export function shortCounties(counties: string[]): string {
  return counties.map((c) => c.replace(/ County$/, "")).join(" & ");
}

type Props = {
  agencies: Agency[];
  /** Show only the first N rows (the dashboard shows 3) */
  limit?: number;
};

export function AgencyVerificationList({ agencies, limit }: Props) {
  const rows = limit ? agencies.slice(0, limit) : agencies;
  return (
    <div className="verification-list">
      {rows.map((agency) => (
        <div key={agency.id}>
          <span className="org-avatar">{agency.name[0]}</span>
          <div>
            <b>{agency.name}</b>
            <p>
              {shortCounties(agency.counties)} · {agency.note ?? `Submitted ${formatDate(agency.submittedOn)}`}
            </p>
          </div>
          <Status tone={verificationTone[agency.status]}>{verificationLabel[agency.status]}</Status>
          <Button to={`/admin/verification?agency=${agency.id}`} variant="ghost">
            Review
          </Button>
        </div>
      ))}
    </div>
  );
}
