import { useEffect, useState, type FormEvent } from "react";
import {
  ClipboardList, Clock, AlertTriangle, CheckCircle,
  Search, Eye, X, RefreshCw
} from "lucide-react";
import { lifecycle, type LifecycleStage } from "../../data/constants/lifecycle";
import type { AssistanceRequest } from "../../types/request";
import {
  getAgencyRequests,
  getSituationReport,
  submitAssessment,
  type AssessmentOutcome,
  type SituationReport
} from "../../services/agencyService";

const PAGE_SIZE = 20;
const inputClass = "rounded-lg border border-gray-300 px-4 py-2.5";

const statusColors: Record<LifecycleStage, string> = {
  "Need identified": "bg-yellow-100 text-yellow-800",
  Assessed: "bg-blue-100 text-blue-700",
  Published: "bg-purple-100 text-purple-700",
  Pledged: "bg-indigo-100 text-indigo-700",
  Allocated: "bg-teal-100 text-teal-700",
  Delivered: "bg-green-100 text-green-700",
  Confirmed: "bg-emerald-100 text-emerald-700"
};

const priorityColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Normal: "bg-green-100 text-green-700",
  Low: "bg-gray-100 text-gray-700"
};

const getPriority = (request: AssistanceRequest) =>
  request.priority?.trim() || request.urgency;

const getReference = (request: AssistanceRequest) =>
  request.reference || `REQ-${request.id}`;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred.";

export default function AssistanceRequests() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [report, setReport] = useState<SituationReport | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [outcome, setOutcome] = useState<AssessmentOutcome>("approved");
  const [assessmentPriority, setAssessmentPriority] = useState("High");
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      setError("");

      const [requestResult, reportResult] = await Promise.allSettled([
        getAgencyRequests(page, PAGE_SIZE),
        getSituationReport()
      ]);

      if (!active) return;

      if (requestResult.status === "fulfilled") {
        setRequests(requestResult.value.items);
        setTotal(requestResult.value.total);
      } else {
        setRequests([]);
        setTotal(0);
        setError(getErrorMessage(requestResult.reason));
      }

      setReport(
        reportResult.status === "fulfilled" ? reportResult.value : null
      );

      setLoading(false);
    }

    void loadRequests();

    return () => {
      active = false;
    };
  }, [page, refreshKey]);

  const selectedRequest = requests.find(r => r.id === selectedId);
  const query = search.trim().toLowerCase();

  const visible = requests.filter(r =>
    (statusFilter === "All" || r.stage === statusFilter) &&
    (priorityFilter === "All" || getPriority(r) === priorityFilter) &&
    [
      getReference(r),
      `Beneficiary #${r.beneficiaryId}`,
      r.title,
      r.resource,
      r.category,
      r.county,
      r.summary
    ].some(value => value.toLowerCase().includes(query))
  );

  const priorities = Array.from(
    new Set(requests.map(getPriority))
  ).sort();

  const stats = [
    {
      title: "Total Requests",
      value: report?.totalRequests ?? total,
      icon: ClipboardList,
      color: "text-green-600"
    },
    {
      title: report ? "Pending Requests" : "Pending (This Page)",
      value: report?.byStage["Need identified"] ??
        requests.filter(r => r.stage === "Need identified").length,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: report ? "Critical Requests" : "Critical (This Page)",
      value: report?.byPriority["Critical"] ??
        requests.filter(r => getPriority(r) === "Critical").length,
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: report ? "Confirmed Requests" : "Confirmed (This Page)",
      value: report?.confirmedRequests ??
        requests.filter(r => r.stage === "Confirmed").length,
      icon: CheckCircle,
      color: "text-green-600"
    }
  ];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function openDetails(request: AssistanceRequest) {
    setSelectedId(request.id);
    setOutcome("approved");
    setAssessmentPriority(getPriority(request));
    setAssessmentNotes("");
    setActionError("");
  }

  function refreshRequests() {
    setRefreshKey(value => value + 1);
  }

  async function handleAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRequest || saving) return;

    setSaving(true);
    setActionError("");
    setSuccess("");

    try {
      await submitAssessment(selectedRequest.id, {
        outcome,
        priority: assessmentPriority,
        notes: assessmentNotes.trim() || null
      });

      setSelectedId(null);
      setSuccess(`Assessment saved for ${getReference(selectedRequest)}.`);
      refreshRequests();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Assistance Requests
          </h1>
          <p className="mt-2 text-gray-600">
            Review and manage humanitarian assistance requests.
          </p>
          <p className="mt-2 text-sm text-green-700">
            Connected to the Pamoja Agency API.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Unable to load assistance requests</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={refreshRequests}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {success && (
        <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon className={`mb-3 ${color}`} size={20} />
            <p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">
              {loading ? "..." : value}
            </h2>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          All Assistance Requests
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Search, filter and review requests assigned to your agency.
        </p>

        <div className="my-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search requests..."
              aria-label="Search requests"
              className={`${inputClass} w-full pl-10`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter request status"
            className={inputClass}
          >
            <option value="All">All Statuses</option>
            {lifecycle.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            aria-label="Filter request priority"
            className={inputClass}
          >
            <option value="All">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Request ID",
                  "Beneficiary",
                  "Category",
                  "County",
                  "Priority",
                  "Status",
                  "Action"
                ].map(heading => (
                  <th key={heading} className="p-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {!loading && visible.map(request => (
                <tr
                  key={request.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    {getReference(request)}
                  </td>

                  <td className="p-4">
                    Beneficiary #{request.beneficiaryId}
                  </td>

                  <td className="p-4">{request.category}</td>

                  <td className="p-4">{request.county}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        priorityColors[getPriority(request)] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {getPriority(request)}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusColors[request.stage]
                      }`}
                    >
                      {request.stage}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => openDetails(request)}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                    >
                      <Eye size={15} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p className="py-10 text-center text-gray-500" role="status">
              Loading assistance requests...
            </p>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="py-10 text-center">
              <ClipboardList
                size={32}
                className="mx-auto mb-3 text-gray-400"
              />
              <p className="text-gray-500">
                {requests.length === 0
                  ? "No assistance requests have been assigned to your agency."
                  : "No matching requests found."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div>
            <p className="text-sm text-gray-500">
              Showing {visible.length} matching requests on this page
              {" "}of {total} assigned requests.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Search and filters apply to the current page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => {
                setSelectedId(null);
                setPage(value => Math.max(1, value - 1));
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => {
                setSelectedId(null);
                setPage(value => value + 1);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !saving) {
              setSelectedId(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="request-title" className="text-xl font-bold">
                Request Details — {getReference(selectedRequest)}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                disabled={saving}
                aria-label="Close request details"
                className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              {([
                ["Beneficiary", `Beneficiary #${selectedRequest.beneficiaryId}`],
                ["Title", selectedRequest.title],
                ["Category", selectedRequest.category],
                ["County", selectedRequest.county],
                ["Resource", selectedRequest.resource],
                ["Quantity Required", `${selectedRequest.quantity} ${selectedRequest.unit}`],
                ["Quantity Allocated", `${selectedRequest.allocated} ${selectedRequest.unit}`],
                ["Quantity Remaining", `${Math.max(0, selectedRequest.quantity - selectedRequest.allocated)} ${selectedRequest.unit}`],
                ["Priority", getPriority(selectedRequest)],
                ["Status", selectedRequest.stage],
                ["Description", selectedRequest.summary]
              ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-4 border-b pb-2">
                  <dt className="w-36 shrink-0 font-semibold text-gray-600">
                    {label}
                  </dt>
                  <dd className="break-words text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>

            {selectedRequest.stage === "Need identified" ? (
              <form onSubmit={handleAssessment} className="mt-6 space-y-4">
                <h3 className="font-semibold text-gray-800">
                  Assess Request
                </h3>

                <div>
                  <label
                    htmlFor="assessment-outcome"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Assessment Decision
                  </label>

                  <select
                    id="assessment-outcome"
                    value={outcome}
                    onChange={event =>
                      setOutcome(event.target.value as AssessmentOutcome)
                    }
                    className={`${inputClass} w-full`}
                  >
                    <option value="approved">Approve Request</option>
                    <option value="rejected">Reject Request</option>
                    <option value="needs_info">Request More Information</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assessment-priority"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>

                  <select
                    id="assessment-priority"
                    value={assessmentPriority}
                    onChange={event =>
                      setAssessmentPriority(event.target.value)
                    }
                    className={`${inputClass} w-full`}
                  >
                    {!["Low", "Medium", "High", "Critical"].includes(
                      assessmentPriority
                    ) && (
                      <option value={assessmentPriority}>
                        {assessmentPriority}
                      </option>
                    )}
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assessment-notes"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Assessment Notes
                  </label>

                  <textarea
                    id="assessment-notes"
                    value={assessmentNotes}
                    onChange={event =>
                      setAssessmentNotes(event.target.value)
                    }
                    placeholder="Enter assessment findings..."
                    maxLength={2000}
                    rows={4}
                    className={`${inputClass} w-full`}
                  />
                </div>

                {actionError && (
                  <p role="alert" className="text-sm text-red-600">
                    {actionError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving Assessment..." : "Submit Assessment"}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                This request is at the {selectedRequest.stage} stage.
                Further actions are managed through the relevant Agency workflow.
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedId(null)}
              disabled={saving}
              className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}