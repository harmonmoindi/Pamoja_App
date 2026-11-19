import { useState, type FormEvent } from "react";
import { ClipboardCheck, Clock, CheckCircle, Search, X } from "lucide-react";

type AssessmentPriority = "Critical" | "High" | "Normal";
interface AssessmentRequest {
  id: string; beneficiary: string; category: string; county: string; description: string;
}
interface Assessment { priority: AssessmentPriority; recommendation: string; notes: string }
const initialRequests: AssessmentRequest[] = [
  { id: "REQ001", beneficiary: "Beneficiary A", category: "Food Supplies", county: "Nairobi", description: "Emergency food assistance for affected households." },
  { id: "REQ002", beneficiary: "Beneficiary B", category: "Medical Supplies", county: "Kiambu", description: "Medical support and supplies required." },
  { id: "REQ003", beneficiary: "Beneficiary C", category: "Clothing", county: "Machakos", description: "Clothing support for vulnerable families." },
  { id: "REQ004", beneficiary: "Beneficiary D", category: "Shelter", county: "Kajiado", description: "Temporary shelter materials required." }
];
const inputClass = "w-full rounded-lg border border-gray-300 p-3";

export default function NeedsAssessment() {
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  const [selectedRequest, setSelectedRequest] = useState<AssessmentRequest | null>(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<AssessmentPriority>("Normal");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const completeCount = initialRequests.filter(r => Boolean(assessments[r.id])).length;
  const query = search.trim().toLowerCase();
  const visible = initialRequests.filter(r => [r.id, r.beneficiary, r.category, r.county].some(s => s.toLowerCase().includes(query)));
  const stats = [
    { title: "Total Assessments Required", value: initialRequests.length, icon: ClipboardCheck },
    { title: "Pending Assessments", value: initialRequests.length - completeCount, icon: Clock },
    { title: "Completed Assessments", value: completeCount, icon: CheckCircle }
  ];

  function openAssessment(request: AssessmentRequest) {
    const previous = assessments[request.id];
    setSelectedRequest(request);
    setPriority(previous?.priority ?? "Normal");
    setRecommendation(previous?.recommendation ?? "");
    setNotes(previous?.notes ?? "");
    setError("");
  }
  function saveAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRequest || !recommendation.trim()) return setError("Enter an assistance recommendation.");
    setAssessments(prev => ({ ...prev, [selectedRequest.id]: { priority, recommendation: recommendation.trim(), notes: notes.trim() } }));
    setSelectedRequest(null); setError("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Needs Assessment</h1>
        <p className="mt-2 text-gray-600">Evaluate beneficiary needs and recommend appropriate humanitarian assistance.</p>
        <p className="mt-2 text-sm text-amber-700">Demo mode — assessments are not saved to the database.</p>
      </header>
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon size={20} className="mb-3 text-green-600" /><p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold">Beneficiary Requests</h2>
          <div className="relative"><Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." aria-label="Search assessment requests" className={`${inputClass} pl-10`} />
          </div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-gray-50"><tr>
            {["Request ID", "Beneficiary", "Category", "County", "Status", "Action"].map(h => <th key={h} className="p-4">{h}</th>)}
          </tr></thead>
          <tbody>{visible.map(r => (
            <tr key={r.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-semibold">{r.id}</td><td className="p-4">{r.beneficiary}</td>
              <td className="p-4">{r.category}</td><td className="p-4">{r.county}</td>
              <td className="p-4"><span className={`rounded-full px-3 py-1 ${assessments[r.id] ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}>
                {assessments[r.id] ? "Assessed" : "Pending Assessment"}</span></td>
              <td className="p-4"><button type="button" onClick={() => openAssessment(r)} className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700">
                {assessments[r.id] ? "Edit Assessment" : "Assess Request"}
              </button></td>
            </tr>
          ))}</tbody>
        </table>{!visible.length && <p className="py-8 text-center text-gray-500">No matching requests.</p>}</div>
      </section>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="assessment-title" className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="assessment-title" className="text-xl font-semibold">Needs Assessment — {selectedRequest.id}</h2>
              <button type="button" onClick={() => setSelectedRequest(null)} aria-label="Close assessment"><X size={22} /></button>
            </div>
            <dl className="mb-6 space-y-2 text-sm">
              {([ ["Beneficiary", selectedRequest.beneficiary], ["Category", selectedRequest.category], ["County", selectedRequest.county], ["Request Description", selectedRequest.description] ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-3"><dt className="w-36 shrink-0 font-semibold text-gray-600">{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            <form onSubmit={saveAssessment} className="space-y-4">
              <label className="block font-medium">Priority
                <select value={priority} onChange={e => setPriority(e.target.value as AssessmentPriority)} className={`mt-2 ${inputClass}`}>
                  {(["Critical", "High", "Normal"] as AssessmentPriority[]).map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="block font-medium">Assistance Recommendation
                <textarea required value={recommendation} onChange={e => setRecommendation(e.target.value)} rows={3} className={`mt-2 ${inputClass}`} placeholder="Recommend support to provide" />
              </label>
              <label className="block font-medium">Assessment Notes
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`mt-2 ${inputClass}`} placeholder="Additional observations" />
              </label>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" className="rounded-lg bg-green-600 px-5 py-3 text-white">Save Assessment</button>
                <button type="button" onClick={() => setSelectedRequest(null)} className="rounded-lg border px-5 py-3">Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
