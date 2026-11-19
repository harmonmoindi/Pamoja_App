import { useState } from "react";
import { PageHead } from "@/components/ui/PageHead";
import { DuplicateReview } from "@/components/portal/DuplicateReview";
import { duplicates } from "@/data/mock/duplicates";
import { DuplicatePair, DuplicateStatus } from "@/types/admin";

export default function DuplicateReviewPage() {
  // Local copy so the decisions work in the demo; the back-end replaces this later.
  const [pairs, setPairs] = useState<DuplicatePair[]>(duplicates);
  const [filter, setFilter] = useState<"all" | DuplicateStatus>("needs-review");

  const decide = (id: string, decision: "separate" | "escalated") =>
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, status: decision } : p)));

  const visible = pairs.filter((p) => filter === "all" || p.status === filter);
  const waiting = pairs.filter((p) => p.status === "needs-review").length;

  return (
    <>
      <PageHead
        eyebrow="Demonstration workspace"
        title="Potential duplicate review"
        description="Review similar requests carefully—similarity alone does not imply fraud."
      />

      <div className="panel">
        <div className="result-tools">
          <p style={{ flex: 1, margin: 0, alignSelf: "center" }}>
            <b>{waiting}</b> {waiting === 1 ? "pair needs" : "pairs need"} review
          </p>
          <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | DuplicateStatus)}>
            <option value="needs-review">Needs review</option>
            <option value="separate">Marked as separate</option>
            <option value="escalated">Escalated</option>
            <option value="all">All pairs</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {visible.map((pair) => (
            <DuplicateReview key={pair.id} pair={pair} onDecide={decide} />
          ))}
        </div>

        {visible.length === 0 && <p style={{ padding: "18px 4px" }}>Nothing to show for this filter.</p>}
      </div>
    </>
  );
}
