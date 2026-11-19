import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Status } from "@/components/ui/Status";
import { DuplicatePair, DuplicateStatus, RequestSummary } from "@/types/admin";
import { formatDate } from "@/utils/format";

const statusLabel: Record<DuplicateStatus, string> = {
  "needs-review": "Needs review",
  separate: "Marked as separate",
  escalated: "Escalated for assessment",
};

const statusTone: Record<DuplicateStatus, string> = {
  "needs-review": "gold",
  separate: "green",
  escalated: "blue",
};

function RequestSide({ label, request }: { label: string; request: RequestSummary }) {
  return (
    <div>
      <small>
        {label} · {request.reference}
      </small>
      <h3>{request.title}</h3>
      <p>
        {request.category} · {request.county} · {formatDate(request.submittedOn)}
      </p>
    </div>
  );
}

type Props = {
  pair: DuplicatePair;
  onDecide?: (id: string, decision: "separate" | "escalated") => void;
};

export function DuplicateReview({ pair, onDecide }: Props) {
  return (
    <div className="duplicate-card">
      <div className="duplicate-head">
        <span>
          <CircleAlert />
        </span>
        <div>
          <b>Potentially similar requests</b>
          <p>Flagged by shared category, date range, and generalized location.</p>
        </div>
        <Status tone={statusTone[pair.status]}>{statusLabel[pair.status]}</Status>
      </div>
      <div className="compare">
        <RequestSide label="Request A" request={pair.a} />
        <div className="similarity">
          <b>
            {pair.signals.length} shared signal{pair.signals.length === 1 ? "" : "s"}
          </b>
          {pair.signals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
        <RequestSide label="Request B" request={pair.b} />
      </div>
      {pair.status === "needs-review" && (
        <div className="duplicate-actions">
          <Button variant="outline" onClick={() => onDecide?.(pair.id, "separate")}>
            Mark as separate
          </Button>
          <Button onClick={() => onDecide?.(pair.id, "escalated")}>Escalate for assessment</Button>
        </div>
      )}
    </div>
  );
}
