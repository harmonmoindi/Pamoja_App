import { useState } from "react";
import { ClipboardList, Clock, AlertTriangle, CheckCircle, Search, Eye, X } from "lucide-react";

type RequestStatus = "Pending" | "Under Review" | "Approved" | "Rejected" | "Completed";
type RequestPriority = "Critical" | "High" | "Normal";
interface AssistanceRequest {
  id: string; beneficiary: string; category: string; county: string;
  priority: RequestPriority; status: RequestStatus; description: string;
}

const initialRequests: AssistanceRequest[] = [
  { id: "REQ001", beneficiary: "Beneficiary A", category: "Food Supplies", county: "Nairobi", priority: "Critical", status: "Pending", description: "Emergency food packages required for affected households." },
  { id: "REQ002", beneficiary: "Beneficiary B", category: "Medical Supplies", county: "Kiambu", priority: "High", status: "Under Review", description: "Medical supplies requested for urgent community care." },
  { id: "REQ003", beneficiary: "Beneficiary C", category: "Clothing", county: "Machakos", priority: "Normal", status: "Approved", description: "Clothing assistance requested for vulnerable families." },
  { id: "REQ004", beneficiary: "Beneficiary D", category: "Shelter", county: "Kajiado", priority: "Critical", status: "Pending", description: "Temporary shelter materials urgently needed." },
  { id: "REQ005", beneficiary: "Beneficiary E", category: "Food Supplies", county: "Nakuru", priority: "High", status: "Completed", description: "Food assistance request fulfilled." }
];
const nextStatuses: Record<RequestStatus, RequestStatus[]> = {
  Pending: ["Under Review", "Approved", "Rejected"],
  "Under Review": ["Approved", "Rejected"],
  Approved: ["Completed"], Rejected: [], Completed: []
};
const priorityColors: Record<RequestPriority, string> = {
  Critical: "bg-red-100 text-red-700", High: "bg-orange-100 text-orange-700", Normal: "bg-green-100 text-green-700"
};
const statusColors: Record<RequestStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800", "Under Review": "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700", Rejected: "bg-red-100 text-red-700", Completed: "bg-gray-100 text-gray-700"
};
const inputClass = "rounded-lg border border-gray-300 px-4 py-2.5";

export default function AssistanceRequests() {
  const [requests, setRequests] = useState<AssistanceRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRequest = requests.find(r => r.id === selectedId);
  const query = search.trim().toLowerCase();
  const visible = requests.filter(r =>
    (statusFilter === "All" || r.status === statusFilter) &&
    (priorityFilter === "All" || r.priority === priorityFilter) &&
    [r.id, r.beneficiary, r.category, r.county].some(value => value.toLowerCase().includes(query))
  );
  const stats = [
    { title: "Total Requests", value: requests.length, icon: ClipboardList, color: "text-green-600" },
    { title: "Pending Requests", value: requests.filter(r => r.status === "Pending").length, icon: Clock, color: "text-orange-600" },
    { title: "Critical Requests", value: requests.filter(r => r.priority === "Critical").length, icon: AlertTriangle, color: "text-red-600" },
    { title: "Completed Requests", value: requests.filter(r => r.status === "Completed").length, icon: CheckCircle, color: "text-green-600" }
  ];

  function updateStatus(id: string, status: RequestStatus) {
    setRequests(prev => prev.map(r => r.id === id && nextStatuses[r.status].includes(status) ? { ...r, status } : r));
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assistance Requests</h1>
        <p className="mt-2 text-gray-600">Review and manage humanitarian assistance requests.</p>
        <p className="mt-2 text-sm text-amber-700">Demo mode — changes are not saved to the database.</p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon className={`mb-3 ${color}`} size={20} />
            <p className="text-gray-600">{title}</p><h2 className="mt-2 text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">All Assistance Requests</h2>
        <p className="mt-1 text-sm text-gray-500">Search, filter and review submitted requests.</p>
        <div className="my-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." aria-label="Search requests" className={`${inputClass} w-full pl-10`} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter request status" className={inputClass}>
            {["All", ...Object.keys(statusColors)].map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} aria-label="Filter request priority" className={inputClass}>
            {["All", ...Object.keys(priorityColors)].map(p => <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50"><tr>
              {["Request ID", "Beneficiary", "Category", "County", "Priority", "Status", "Action"].map(h => <th key={h} className="p-4">{h}</th>)}
            </tr></thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-semibold">{r.id}</td><td className="p-4">{r.beneficiary}</td>
                  <td className="p-4">{r.category}</td><td className="p-4">{r.county}</td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 ${priorityColors[r.priority]}`}>{r.priority}</span></td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 ${statusColors[r.status]}`}>{r.status}</span></td>
                  <td className="p-4"><button type="button" onClick={() => setSelectedId(r.id)} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"><Eye size={15} /> View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <p className="py-8 text-center text-gray-500">No matching requests found.</p>}
        </div>
        <p className="mt-3 text-sm text-gray-500">Showing {visible.length} of {requests.length} requests</p>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelectedId(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="request-title" className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="request-title" className="text-xl font-bold">Request Details — {selectedRequest.id}</h2>
              <button type="button" onClick={() => setSelectedId(null)} aria-label="Close request details"><X size={22} /></button>
            </div>
            <dl className="space-y-3 text-sm">
              {([ ["Beneficiary", selectedRequest.beneficiary], ["Category", selectedRequest.category], ["County", selectedRequest.county], ["Priority", selectedRequest.priority], ["Status", selectedRequest.status], ["Description", selectedRequest.description] ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-4 border-b pb-2"><dt className="w-28 shrink-0 font-semibold text-gray-600">{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            <h3 className="mt-6 mb-3 font-semibold">Update Request Status</h3>
            <div className="flex flex-wrap gap-2">
              {nextStatuses[selectedRequest.status].map(status => (
                <button key={status} type="button" onClick={() => updateStatus(selectedRequest.id, status)} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">{status}</button>
              ))}
              {!nextStatuses[selectedRequest.status].length && <p className="text-sm text-gray-500">No further status actions are available.</p>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
