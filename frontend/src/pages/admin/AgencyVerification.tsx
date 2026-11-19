import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHead } from "@/components/ui/PageHead";
import { Status } from "@/components/ui/Status";
import {
  AgencyVerificationList,
  shortCounties,
  verificationLabel,
  verificationTone,
} from "@/components/portal/AgencyVerificationList";
import { agencies } from "@/data/mock/agencies";
import { Agency, VerificationStatus } from "@/types/admin";
import { formatDate } from "@/utils/format";

type Filter = "all" | VerificationStatus;

export default function AgencyVerification() {
  // Local copy so Approve / Request more information work in the demo.
  // The back-end replaces this with real API calls later.
  const [items, setItems] = useState<Agency[]>(agencies);
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const detailRef = useRef<HTMLElement>(null);

  // Opened from the dashboard as /admin/verification?agency=ag-001
  const selectedId = params.get("agency");
  const selected = items.find((a) => a.id === selectedId) ?? items.find((a) => a.status !== "verified") ?? items[0];

  useEffect(() => {
    if (selectedId) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  const visible = useMemo(
    () =>
      items.filter(
        (a) =>
          (filter === "all" || a.status === filter) &&
          a.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [items, filter, query],
  );

  const update = (id: string, changes: Partial<Agency>) =>
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const toggleItem = (index: number) => {
    if (selected.status === "verified") return;
    update(selected.id, {
      checklist: selected.checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c)),
    });
  };

  const allChecked = selected.checklist.every((c) => c.done);

  const requestInfo = () => {
    update(selected.id, { status: "more-info", note: "Information requested" });
    setModal({
      title: "Information requested",
      message: `A request for more information was recorded for ${selected.name}. (Demonstration only: no message is sent.)`,
    });
  };

  const approve = () => {
    update(selected.id, { status: "verified", note: undefined });
    setModal({
      title: "Agency approved",
      message: `${selected.name} is now a verified agency and can publish needs and manage deliveries.`,
    });
  };

  return (
    <>
      <PageHead
        eyebrow="Demonstration workspace"
        title="Agency verification"
        description="Review organization applications and verification evidence."
      />

      <div className="panel">
        <div className="result-tools">
          <div className="search-box">
            <Search />
            <input
              placeholder="Search agencies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="all">All statuses</option>
            {(Object.keys(verificationLabel) as VerificationStatus[]).map((s) => (
              <option key={s} value={s}>
                {verificationLabel[s]}
              </option>
            ))}
          </select>
        </div>
        {visible.length > 0 ? (
          <AgencyVerificationList agencies={visible} />
        ) : (
          <p style={{ padding: "18px 4px" }}>No agencies match your search.</p>
        )}
      </div>

      <section className="panel" ref={detailRef} style={{ marginTop: 20 }}>
        <div className="verification-detail">
          <div>
            <span className="org-avatar large">{selected.name[0]}</span>
            <h2>{selected.name}</h2>
            <p>{shortCounties(selected.counties)} Counties</p>
            <p>{selected.categories.join(", ")}</p>
            <p>Submitted {formatDate(selected.submittedOn)}</p>
            <Status tone={verificationTone[selected.status]}>{verificationLabel[selected.status]}</Status>
          </div>

          <div className="checklist">
            <h3>Review checklist</h3>
            {selected.checklist.map((item, i) => (
              <label
                key={item.label}
                role="checkbox"
                aria-checked={item.done}
                tabIndex={0}
                onClick={() => toggleItem(i)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleItem(i);
                  }
                }}
              >
                <span className={item.done ? "checked" : ""}>{item.done && <Check />}</span>
                {item.label}
              </label>
            ))}

            {selected.status !== "verified" && (
              <>
                <label>
                  Administrative notes
                  <textarea
                    placeholder="Add private review notes..."
                    value={notes[selected.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [selected.id]: e.target.value })}
                  />
                </label>
                {!allChecked && (
                  <p>Complete every checklist item before approving, or request more information.</p>
                )}
                <div>
                  <Button variant="outline" onClick={requestInfo}>
                    Request more information
                  </Button>
                  <Button onClick={approve} disabled={!allChecked}>
                    Approve agency
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal?.title ?? ""}>
        <p>{modal?.message}</p>
        <Button onClick={() => setModal(null)}>Done</Button>
      </Modal>
    </>
  );
}