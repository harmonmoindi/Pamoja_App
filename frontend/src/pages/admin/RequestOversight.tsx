import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Metric } from "@/components/ui/Metric";
import { PageHead } from "@/components/ui/PageHead";
import { Progress } from "@/components/ui/Progress";
import { Status } from "@/components/ui/Status";
import { lifecycle, LifecycleStage } from "@/data/constants/lifecycle";
import { adminRequests } from "@/data/mock/adminRequests";
import { Priority } from "@/types/admin";
import { formatDate } from "@/utils/format";

const priorities: Priority[] = ["Urgent", "High priority", "Standard"];
const priorityTone: Record<Priority, string> = {
  Urgent: "red",
  "High priority": "gold",
  Standard: "blue",
};

function stageTone(stage: LifecycleStage): string {
  const i = lifecycle.indexOf(stage);
  if (i >= 5) return "green"; // Delivered, Confirmed
  if (i >= 2) return "blue"; // Published, Pledged, Allocated
  return "gold"; // Need identified, Assessed
}

const columns = "1.7fr 1fr 1fr 1.5fr 1.3fr 0.9fr 0.8fr";

export default function RequestOversight() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"all" | LifecycleStage>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminRequests.filter(
      (r) =>
        (stage === "all" || r.stage === stage) &&
        (priority === "all" || r.priority === priority) &&
        (r.reference.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.agency.toLowerCase().includes(q)),
    );
  }, [query, stage, priority]);

  const completed = adminRequests.filter((r) => r.stage === "Delivered" || r.stage === "Confirmed").length;
  const urgent = adminRequests.filter((r) => r.priority === "Urgent").length;

  return (
    <>
      <PageHead
        eyebrow="Demonstration workspace"
        title="Humanitarian request oversight"
        description="Monitor request handling across participating agencies."
      />

      <div className="portal-metrics">
        <Metric label="Total requests" value={String(adminRequests.length)} note="Across all agencies" tone="green" />
        <Metric label="Urgent" value={String(urgent)} note="Need quick attention" tone="gold" />
        <Metric
          label="In progress"
          value={String(adminRequests.length - completed)}
          note="Before delivery"
          tone="blue"
        />
        <Metric label="Completed" value={String(completed)} note="Delivered or confirmed" tone="navy" />
      </div>

      <div className="panel">
        <div className="result-tools">
          <div className="search-box">
            <Search />
            <input
              placeholder="Search by reference, title or agency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={stage} onChange={(e) => setStage(e.target.value as "all" | LifecycleStage)}>
            <option value="all">All stages</option>
            {lifecycle.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as "all" | Priority)}>
            <option value="all">All priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div className="data-table" style={{ minWidth: 980 }}>
            <div className="table-head" style={{ gridTemplateColumns: columns }}>
              <span>Request</span>
              <span>Category</span>
              <span>County</span>
              <span>Agency</span>
              <span>Stage</span>
              <span>Priority</span>
              <span>Updated</span>
            </div>
            {visible.map((r) => (
              <div className="table-row" key={r.reference} style={{ gridTemplateColumns: columns }}>
                <div>
                  <b>{r.title}</b>
                  <br />
                  <small style={{ color: "var(--muted)" }}>{r.reference}</small>
                </div>
                <span>{r.category}</span>
                <span>{r.county}</span>
                <span>{r.agency}</span>
                <div>
                  <Status tone={stageTone(r.stage)}>{r.stage}</Status>
                  <Progress value={Math.round(((lifecycle.indexOf(r.stage) + 1) / lifecycle.length) * 100)} tone={stageTone(r.stage)} />
                </div>
                <Status tone={priorityTone[r.priority]}>{r.priority}</Status>
                <span>{formatDate(r.updatedOn)}</span>
              </div>
            ))}
          </div>
        </div>

        {visible.length === 0 && <p style={{ padding: "18px 4px" }}>No requests match your filters.</p>}
        <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 11 }}>
          Showing {visible.length} of {adminRequests.length} requests
        </p>
      </div>
    </>
  );
}
