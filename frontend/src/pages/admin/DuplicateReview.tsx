import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { PageHead } from "@/components/ui/PageHead";
import { DuplicateReview } from "@/components/portal/DuplicateReview";
import { useAsync } from "@/hooks/useAsync";
import { errorMessage } from "@/lib/errors";
import { decideDuplicate, listDuplicates, scanDuplicates } from "@/services/adminService";
import { DuplicatePair, DuplicateStatus } from "@/types/admin";

export default function DuplicateReviewPage() {
  const [filter, setFilter] = useState<"all" | DuplicateStatus>("needs-review");
  const [actionError, setActionError] = useState("");
  const [note, setNote] = useState("");
  const [scanning, setScanning] = useState(false);

  const { data, setData, loading, error, reload } = useAsync(() => listDuplicates({ perPage: 100 }), []);
  const pairs = data?.items ?? [];
  const visible = pairs.filter((p) => filter === "all" || p.status === filter);
  const waiting = pairs.filter((p) => p.status === "needs-review").length;

  async function decide(id: number | string, decision: "separate" | "escalated") {
    setActionError("");
    try {
      const { duplicate } = await decideDuplicate(id, decision);
      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((p: DuplicatePair) => (p.id === duplicate.id ? duplicate : p)) } : prev,
      );
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function scan() {
    setActionError("");
    setNote("");
    setScanning(true);
    try {
      const { created } = await scanDuplicates();
      setNote(created === 0 ? "No new similar requests found." : `${created} new pair${created === 1 ? "" : "s"} flagged for review.`);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setScanning(false);
    }
  }

  return (
    <>
      <PageHead
        eyebrow="Platform administration"
        title="Potential duplicate review"
        description="Review similar requests carefully—similarity alone does not imply fraud."
        action={
          <Button variant="outline" onClick={() => void scan()} disabled={scanning}>
            {scanning ? "Scanning…" : "Scan for duplicates"}
          </Button>
        }
      />

      <div className="panel">
        <div className="result-tools">
          <p style={{ flex: 1, margin: 0, alignSelf: "center" }}>
            <b>{waiting}</b> {waiting === 1 ? "pair needs" : "pairs need"} review
            {note && <span style={{ color: "var(--muted)" }}> · {note}</span>}
          </p>
          <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | DuplicateStatus)}>
            <option value="needs-review">Needs review</option>
            <option value="separate">Marked as separate</option>
            <option value="escalated">Escalated</option>
            <option value="all">All pairs</option>
          </select>
        </div>

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {actionError && <ErrorNotice message={actionError} />}
        {!data && loading && <Loading label="Loading flagged pairs…" />}

        {data && (
          <div style={{ display: "grid", gap: 16 }}>
            {visible.map((pair) => (
              <DuplicateReview key={pair.id} pair={pair} onDecide={(id, decision) => void decide(id, decision)} />
            ))}
          </div>
        )}
        {data && visible.length === 0 && (
          <p style={{ padding: "18px 4px" }}>Nothing to show. Use “Scan for duplicates” to look for similar requests.</p>
        )}
      </div>
    </>
  );
}