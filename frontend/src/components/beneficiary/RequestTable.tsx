import { Link } from "react-router";
import { BeneficiaryRequest } from "@/data/mock/beneficiaryRequests";

export function RequestTable({ requests, caption }: { requests: BeneficiaryRequest[]; caption: string }) {
  return (
    <div className="bn-table-wrap">
      <table className="bn-table">
        <caption className="bn-sr">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Request</th>
            <th scope="col">Category</th>
            <th scope="col">Location</th>
            <th scope="col">Status</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.reference}>
              <td>
                <span className="bn-req-title">{request.title}</span>
                <span className="bn-req-ref">{request.reference}</span>
              </td>
              <td>{request.category}</td>
              <td>{request.location}</td>
              <td>
                <span className={`bn-status ${request.status === "approved" ? "" : request.status.replace(" ", "-")}`}>
                  {request.status}
                </span>
              </td>
              <td>
                <Link className="bn-view" to={`/beneficiary/requests/${request.reference}`}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
