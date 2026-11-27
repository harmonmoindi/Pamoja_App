import { useState } from "react";
import { Search } from "lucide-react";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Metric } from "@/components/ui/Metric";
import { PageHead } from "@/components/ui/PageHead";
import { Progress } from "@/components/ui/Progress";
import { Status } from "@/components/ui/Status";
import { lifecycle, LifecycleStage } from "@/data/constants/lifecycle";
import { useAsync, useDebounced } from "@/hooks/useAsync";
import { listOversightRequests } from "@/services/adminService";
import { Priority } from "@/types/admin";
import { formatDate } from "@/utils/format";

const priorities: Priority[] = ["Urgent", "High priority", "Standard"];
const priorityTone: Record<Priority, string> = {
  Urgent: "red",
  "High priority": "gold",
  Standard: "blue",
};

function stageIndex(stage: string): number {
  return lifecycle.indexOf(stage as LifecycleStage);
}

function stageTone(stage: string): string {
  const i = stageIndex(stage);
  if (i >= 5) return "green"; // Delivered, Confirmed
  if (i >= 2) return "blue"; // Published, Pledged, Allocated
  return "gold"; // Need identified, Assessed (or an unknown stage)
}

const columns = "1.7fr 1fr 1fr 1.5fr 1.3fr 0.9fr 0.8fr";

export default function RequestOversight() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const q = useDebounced(query);

  const { data, loading, error, reload } = useAsync(
    () =>
      listOversightRequests({
        q: q || undefined,
        stage: stage === "all" ? undefined : stage,
        priority: priority === "all" ? undefined : priority,
        perPage: 100,
      }),
    [q, stage, priority],
  );
  const requests = data?.items ?? [];
  const urgent = requests.filter((r) => r.priority === "Urgent").length;
  const completed = requests.filter((r) => stageIndex(r.stage) >= 5).length;

  return (
    <>
      <PageHead
        eyebrow="Platform administration"
        title="Humanitarian request oversight"
        description="Monitor live assistance requests across participating agencies."
      />

      <div className="portal-metrics">
        <Metric label="Matching requests" value={String(data?.total ?? 0)} note="Across all agencies" tone="green" />
        <Metric label="Urgent" value={String(urgent)} note="Need quick attention" tone="gold" />
        <Metric label="In progress" value={String(requests.length - completed)} note="Before delivery" tone="blue" />
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
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
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
          <button type="button" onClick={reload} disabled={loading}>
            Refresh
          </button>
        </div>

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {!data && loading && <Loading label="Loading requests…" />}

        {data && (
          <>
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
                {requests.map((r) => (
                  <div className="table-row" key={r.id ?? r.reference} style={{ gridTemplateColumns: columns }}>
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
                      <Progress
                        value={Math.round(((Math.max(stageIndex(r.stage), -1) + 1) / lifecycle.length) * 100)}
                        tone={stageTone(r.stage)}
                      />
                    </div>
                    <Status tone={priorityTone[r.priority] ?? "blue"}>{r.priority}</Status>
                    <span>{formatDate(r.updatedOn)}</span>
                  </div>
                ))}
              </div>
            </div>

            {requests.length === 0 && <p style={{ padding: "18px 4px" }}>No requests match your filters.</p>}
            <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 11 }}>
              Showing {requests.length} of {data.total} requests
            </p>
          </>
        )}
      </div>
    </>
  );
}
