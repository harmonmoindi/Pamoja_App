import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";
import { AuditList } from "@/components/portal/AuditList";
import { auditEvents } from "@/data/mock/auditEvents";
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditEvents.filter(
      (e) =>
        (kind === "all" || e.kind === kind) &&
        (e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q)),
    );
  }, [query, kind]);

  return (
    <>
      <PageHead
        eyebrow="Demonstration workspace"
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

        {visible.length > 0 ? (
          <AuditList events={visible} />
        ) : (
          <p style={{ padding: "18px 4px" }}>No activity matches your search.</p>
        )}
        <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 11 }}>
          Showing {visible.length} of {auditEvents.length} events
        </p>
      </div>
    </>
  );
}
