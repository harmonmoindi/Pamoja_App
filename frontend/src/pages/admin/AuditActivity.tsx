import { useState } from "react";
import { Search } from "lucide-react";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { PageHead } from "@/components/ui/PageHead";
import { AuditList } from "@/components/portal/AuditList";
import { useAsync, useDebounced } from "@/hooks/useAsync";
import { listAudit } from "@/services/adminService";
import { AuditKind } from "@/types/admin";

const kindLabel: Record<AuditKind, string> = {
  request: "Requests",
  delivery: "Deliveries",
  pledge: "Pledges",
  agency: "Agencies",
  user: "Users",
  safety: "Safety flags",
};

export default function AuditActivity() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | AuditKind>("all");
  const q = useDebounced(query);

  const { data, loading, error, reload } = useAsync(
    () => listAudit({ q: q || undefined, kind: kind === "all" ? undefined : kind, perPage: 100 }),
    [q, kind],
  );
  const events = data?.items ?? [];

  return (
    <>
      <PageHead
        eyebrow="Platform administration"
        title="Audit activity"
        description="A recorded timeline of important platform actions."
      />

      <div className="panel">
        <div className="result-tools">
          <div className="search-box">
            <Search />
            <input
              placeholder="Search by action, detail or person..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={kind} onChange={(e) => setKind(e.target.value as "all" | AuditKind)}>
            <option value="all">All activity</option>
            {(Object.keys(kindLabel) as AuditKind[]).map((k) => (
              <option key={k} value={k}>
                {kindLabel[k]}
              </option>
            ))}
          </select>
        </div>

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {!data && loading && <Loading label="Loading activity…" />}
        {data && events.length > 0 && <AuditList events={events} />}
        {data && events.length === 0 && <p style={{ padding: "18px 4px" }}>No activity matches your search.</p>}
        {data && (
          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 11 }}>
            Showing {events.length} of {data.total} events
          </p>
        )}
      </div>
    </>
  );
}
