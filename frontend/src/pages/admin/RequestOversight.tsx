import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Metric } from "@/components/ui/Metric";
import { PageHead } from "@/components/ui/PageHead";
import { Progress } from "@/components/ui/Progress";
import { Status } from "@/components/ui/Status";
import { lifecycle, LifecycleStage } from "@/data/constants/lifecycle";
import { listOversightRequests } from "@/services/adminService";
import { OversightRequest, Priority } from "@/types/admin";
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
  const [requests, setRequests] = useState<OversightRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"all" | LifecycleStage>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const page = await listOversightRequests({
          q: query.trim() || undefined,
          stage: stage === "all" ? undefined : stage,
          perPage: 100,
        });
        if (!active) return;
        setRequests(page.items);
      } catch (err) {
        if (!active) return;
        setRequests([]);
        setError(err instanceof Error ? err.message : "Unable to load assistance requests.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [query, stage, refreshKey]);

  const visible = useMemo(
    () => requests.filter((r) => priority === "all" || r.priority === priority),
    [requests, priority],
  );

  const completed = requests.filter((r) => r.stage === "Delivered" || r.stage === "Confirmed").length;
  const urgent = requests.filter((r) => r.priority === "Urgent").length;

  return (
    <>
      <PageHead
        eyebrow="Admin workspace"
        title="Humanitarian request oversight"
        description="Monitor live assistance requests across participating agencies."
      />

      <div className="portal-metrics">
        <Metric label="Total requests" value={loading ? "…" : String(requests.length)} note="Across all agencies" tone="green" />
        <Metric label="Urgent" value={loading ? "…" : String(urgent)} note="Need quick attention" tone="gold" />
        <Metric
          label="In progress"
          value={loading ? "…" : String(requests.length - completed)}
          note="Before delivery"
          tone="blue"
        />
        <Metric label="Completed" value={loading ? "…" : String(completed)} note="Delivered or confirmed" tone="navy" />
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
          <button type="button" onClick={() => setRefreshKey((n) => n + 1)} disabled={loading}>
            Refresh
          </button>
        </div>

        {error && (
          <p role="alert" style={{ color: "var(--danger, #b91c1c)", padding: "8px 4px" }}>
            {error}
          </p>
        )}

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
            {!loading &&
              visible.map((r) => (
                <div className="table-row" key={r.id} style={{ gridTemplateColumns: columns }}>
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

        {loading && <p style={{ padding: "18px 4px" }}>Loading assistance requests…</p>}
        {!loading && !error && visible.length === 0 && (
          <p style={{ padding: "18px 4px" }}>No requests match your filters.</p>
        )}
        <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 11 }}>
          Showing {visible.length} of {requests.length} requests
        </p>
      </div>
    </>
  );
}
