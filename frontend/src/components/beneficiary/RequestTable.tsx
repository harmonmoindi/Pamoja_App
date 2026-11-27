import { Link } from "react-router";
import { Status } from "@/components/ui/Status";
import { BeneficiaryRequest } from "@/data/mock/beneficiaryRequests";

function statusTone(status: BeneficiaryRequest["status"]) {
  if (status === "under review") return "gold";
  if (status === "fulfilled") return "green";
  return "blue";
}

export function RequestTable({ requests, caption }: { requests: BeneficiaryRequest[]; caption: string }) {
  return (
    <div className="data-table" role="table" aria-label={caption}>
      <div className="table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 0.7fr" }}>
        <span>Request</span>
        <span>Category</span>
        <span>Location</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {requests.map((request) => (
        <div
          className="table-row"
          key={request.reference}
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 0.7fr" }}
        >
          <div>
            <b style={{ color: "var(--navy)" }}>{request.title}</b>
            <br />
            <small style={{ color: "var(--muted)" }}>{request.reference}</small>
          </div>
          <span>{request.category}</span>
          <span>{request.location}</span>
          <Status tone={statusTone(request.status)}>{request.status}</Status>
          <Link className="btn btn-ghost" to={`/beneficiary/requests/${encodeURIComponent(request.reference)}`}>
            View
          </Link>
        </div>
      ))}
    </div>
  );
}
