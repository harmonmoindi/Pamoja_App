import { useEffect, useState, type FormEvent } from "react";
import { ClipboardCheck, Clock, CheckCircle, Search, X, RefreshCw } from "lucide-react";
import type { AssistanceRequest } from "../../types/request";
import { getAgencyRequests, getSituationReport, submitAssessment, type AssessmentOutcome, type SituationReport } from "../../services/agencyService";

type AssessmentPriority = "Critical" | "High" | "Medium" | "Normal" | "Low";
const priorities: AssessmentPriority[] = ["Critical", "High", "Medium", "Normal", "Low"];
const inputClass = "w-full rounded-lg border border-gray-300 p-3";
const getReference = (r: AssistanceRequest) => r.reference || `REQ-${r.id}`;
const getError = (e: unknown) => e instanceof Error ? e.message : "An unexpected error occurred.";

export default function NeedsAssessment() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [report, setReport] = useState<SituationReport | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AssistanceRequest | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [priority, setPriority] = useState<AssessmentPriority>("Normal");
  const [outcome, setOutcome] = useState<AssessmentOutcome>("approved");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRequests() {
      setLoading(true); setLoadError("");
      const [requestResult, reportResult] = await Promise.allSettled([getAgencyRequests(page, 20), getSituationReport()]);
      if (!active) return;
      if (requestResult.status === "fulfilled") {
        setRequests(requestResult.value.items); setTotal(requestResult.value.total);
      } else {
        setRequests([]); setTotal(0); setLoadError(getError(requestResult.reason));
      }
      setReport(reportResult.status === "fulfilled" ? reportResult.value : null);
      setLoading(false);
    }
    void loadRequests();
    return () => { active = false; };
  }, [page, refreshKey]);

  const query = search.trim().toLowerCase();
  const visible = requests.filter(r => [getReference(r), `Beneficiary #${r.beneficiaryId}`, r.title, r.category, r.county, r.resource, r.summary].some(s => s.toLowerCase().includes(query)));
  const pendingCount = report?.byStage["Need identified"] ?? requests.filter(r => r.stage === "Need identified").length;
  const totalCount = report?.totalRequests ?? total;
  const progressedCount = report ? Math.max(0, totalCount - pendingCount) : requests.filter(r => r.stage !== "Need identified").length;
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const stats = [
    { title: "Total Assigned Requests", value: totalCount, icon: ClipboardCheck },
    { title: "Awaiting Progress", value: pendingCount, icon: Clock },
    { title: "Progressed Requests", value: progressedCount, icon: CheckCircle }
  ];

  function refreshRequests() { setRefreshKey(n => n + 1); }

  function openAssessment(r: AssistanceRequest) {
    const p = r.priority || r.urgency;
    setSelectedRequest(r);
    setPriority(priorities.includes(p as AssessmentPriority) ? p as AssessmentPriority : "Normal");
    setOutcome("approved"); setRecommendation(""); setNotes(""); setFormError("");
  }

  async function saveAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRequest || saving || selectedRequest.stage !== "Need identified") return;
    if (!recommendation.trim()) return setFormError("Enter an assistance recommendation.");
    setSaving(true); setFormError(""); setSuccess("");
    const combinedNotes = [`Recommendation: ${recommendation.trim()}`, notes.trim() ? `Additional observations: ${notes.trim()}` : ""].filter(Boolean).join("\n");
    try {
      await submitAssessment(selectedRequest.id, { outcome, priority, notes: combinedNotes });
      setSuccess(`Assessment for ${getReference(selectedRequest)} saved successfully.`);
      setSelectedRequest(null); refreshRequests();
    } catch (e) {
      setFormError(getError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Needs Assessment</h1>
          <p className="mt-2 text-gray-600">Evaluate beneficiary needs and recommend appropriate humanitarian assistance.</p>
        </div>
        <button type="button" onClick={refreshRequests} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh
        </button>
      </header>

      {loadError && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Unable to load assessment requests</p><p className="mt-1 text-sm">{loadError}</p>
        <button type="button" onClick={refreshRequests} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white">Try Again</button>
      </div>}
      {success && <p role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{success}</p>}

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon size={20} className="mb-3 text-green-600" /><p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{loading ? "..." : value}</h2>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold">Beneficiary Requests</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." aria-label="Search assessment requests" className={`${inputClass} pl-10`} />
          </div>
        </div>

        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-gray-50"><tr>
            {["Request ID", "Beneficiary", "Category", "County", "Status", "Action"].map(h => <th key={h} className="p-4">{h}</th>)}
          </tr></thead>
          <tbody>{!loading && visible.map(r => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-semibold">{getReference(r)}</td><td className="p-4">Beneficiary #{r.beneficiaryId}</td>
              <td className="p-4">{r.category}</td><td className="p-4">{r.county}</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${r.stage === "Need identified" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700"}`}>{r.stage}</span></td>
              <td className="p-4"><button type="button" onClick={() => openAssessment(r)} className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700">
                {r.stage === "Need identified" ? "Assess Request" : "View Details"}
              </button></td>
            </tr>
          ))}</tbody>
        </table>
        {loading && <p role="status" className="py-8 text-center text-gray-500">Loading assessment requests...</p>}
        {!loading && !loadError && !visible.length && <p className="py-8 text-center text-gray-500">No matching requests found.</p>}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-gray-500">Showing {visible.length} requests on this page of {total} assigned requests.</p>
          <div className="flex items-center gap-3">
            <button type="button" disabled={page === 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={e => { if (e.target === e.currentTarget && !saving) setSelectedRequest(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="assessment-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="assessment-title" className="text-xl font-semibold">Needs Assessment — {getReference(selectedRequest)}</h2>
              <button type="button" onClick={() => setSelectedRequest(null)} disabled={saving} aria-label="Close assessment"><X size={22} /></button>
            </div>
            <dl className="mb-6 space-y-2 text-sm">
              {([
                ["Beneficiary", `Beneficiary #${selectedRequest.beneficiaryId}`],
                ["Title", selectedRequest.title], ["Category", selectedRequest.category],
                ["County", selectedRequest.county], ["Resource", selectedRequest.resource],
                ["Quantity", `${selectedRequest.quantity} ${selectedRequest.unit}`],
                ["Urgency", selectedRequest.urgency], ["Status", selectedRequest.stage],
                ["Request Description", selectedRequest.summary]
              ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-3"><dt className="w-36 shrink-0 font-semibold text-gray-600">{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>

            {selectedRequest.stage === "Need identified" ? (
              <form onSubmit={saveAssessment} className="space-y-4">
                <label className="block font-medium">Assessment Decision
                  <select value={outcome} onChange={e => setOutcome(e.target.value as AssessmentOutcome)} className={`mt-2 ${inputClass}`}>
                    <option value="approved">Approve Request</option><option value="rejected">Reject Request</option>
                    <option value="needs_info">Request More Information</option>
                  </select>
                </label>
                <label className="block font-medium">Priority
                  <select value={priority} onChange={e => setPriority(e.target.value as AssessmentPriority)} className={`mt-2 ${inputClass}`}>
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="block font-medium">Assistance Recommendation
                  <textarea required maxLength={1200} value={recommendation} onChange={e => setRecommendation(e.target.value)} rows={3} className={`mt-2 ${inputClass}`} placeholder="Recommend support to provide" />
                </label>
                <label className="block font-medium">Assessment Notes
                  <textarea maxLength={300} value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`mt-2 ${inputClass}`} placeholder="Additional observations" />
                </label>
                {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="rounded-lg bg-green-600 px-5 py-3 text-white disabled:opacity-50">{saving ? "Saving..." : "Submit Assessment"}</button>
                  <button type="button" onClick={() => setSelectedRequest(null)} disabled={saving} className="rounded-lg border px-5 py-3 disabled:opacity-50">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                This request is currently at the <strong>{selectedRequest.stage}</strong> stage. Its initial assessment cannot be edited here.
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}