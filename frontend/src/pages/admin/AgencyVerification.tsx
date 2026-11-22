import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Modal } from "@/components/ui/Modal";
import { PageHead } from "@/components/ui/PageHead";
import { Status } from "@/components/ui/Status";
import {
  AgencyVerificationList,
  shortCounties,
  verificationLabel,
  verificationTone,
} from "@/components/portal/AgencyVerificationList";
import { useAsync, useDebounced } from "@/hooks/useAsync";
import { errorMessage } from "@/lib/errors";
import { decideAgency, listAgencies, updateAgency } from "@/services/adminService";
import { Agency, VerificationStatus } from "@/types/admin";
import { formatDate } from "@/utils/format";

type Filter = "all" | VerificationStatus;

export default function AgencyVerification() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const detailRef = useRef<HTMLElement>(null);
  const q = useDebounced(query);

  const { data, setData, loading, error, reload } = useAsync(
    () => listAgencies({ q: q || undefined, status: filter === "all" ? undefined : filter, perPage: 100 }),
    [q, filter],
  );
  const agencies = data?.items ?? [];

  // Opened from the dashboard as /admin/verification?agency=12
  const selectedId = Number(params.get("agency")) || null;
  const selected: Agency | undefined =
    agencies.find((a) => a.id === selectedId) ?? agencies.find((a) => a.status !== "verified") ?? agencies[0];

  useEffect(() => {
    if (selectedId) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId, data]);

  // Show the saved notes of whichever agency is selected
  useEffect(() => {
    setNotes(selected?.adminNotes ?? "");
    setActionError("");
  }, [selected?.id]);

  const replaceAgency = (updated: Agency) =>
    setData((prev) => (prev ? { ...prev, items: prev.items.map((a) => (a.id === updated.id ? updated : a)) } : prev));

  async function run(task: () => Promise<{ agency: Agency }>, onDone?: () => void) {
    setActionError("");
    setBusy(true);
    try {
      const { agency } = await task();
      replaceAgency(agency);
      onDone?.();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const editable = selected !== undefined && selected.status !== "verified";
  const allChecked = selected?.checklist.every((c) => c.done) ?? false;

  const toggleItem = (index: number) => {
    if (!selected || !editable || busy) return;
    void run(() =>
      updateAgency(selected.id, {
        checklist: selected.checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c)),
      }),
    );
  };

  const saveNotes = () => {
    if (!selected || !editable || notes === (selected.adminNotes ?? "")) return;
    void run(() => updateAgency(selected.id, { adminNotes: notes }));
  };

  const requestInfo = () => {
    if (!selected) return;
    void run(
      () => decideAgency(selected.id, "request-info", notes),
      () =>
        setModal({
          title: "Information requested",
          message: `${selected.name} has been asked for more information and was notified.`,
        }),
    );
  };

  const approve = () => {
    if (!selected) return;
    void run(
      () => decideAgency(selected.id, "approve", notes),
      () =>
        setModal({
          title: "Agency approved",
          message: `${selected.name} is now a verified agency and its owner was notified.`,
        }),
    );
  };

  return (
    <>
      <PageHead
        eyebrow="Platform administration"
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

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {!data && loading && <Loading label="Loading agencies…" />}
        {data && agencies.length > 0 && <AgencyVerificationList agencies={agencies} />}
        {data && agencies.length === 0 && <p style={{ padding: "18px 4px" }}>No agencies match your search.</p>}
      </div>

      {selected && (
        <section className="panel" ref={detailRef} style={{ marginTop: 20 }}>
          <div className="verification-detail">
            <div>
              <span className="org-avatar large">{selected.name[0]}</span>
              <h2>{selected.name}</h2>
              <p>{shortCounties(selected.counties)} Counties</p>
              <p>{selected.categories.join(", ")}</p>
              <p>Submitted {formatDate(selected.submittedOn)}</p>
              {selected.ownerName && <p>Contact: {selected.ownerName}</p>}
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

              {actionError && <ErrorNotice message={actionError} />}

              {editable && (
                <>
                  <label>
                    Administrative notes
                    <textarea
                      placeholder="Add private review notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={saveNotes}
                    />
                  </label>
                  {!allChecked && (
                    <p>Complete every checklist item before approving, or request more information.</p>
                  )}
                  <div>
                    <Button variant="outline" onClick={requestInfo} disabled={busy}>
                      Request more information
                    </Button>
                    <Button onClick={approve} disabled={busy || !allChecked}>
                      Approve agency
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal?.title ?? ""}>
        <p>{modal?.message}</p>
        <Button onClick={() => setModal(null)}>Done</Button>
      </Modal>
    </>
  );
}
