import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle, HeartHandshake, Package } from "lucide-react";
import ResourceMatchCards, { type MatchingNeed, type MatchingResource } from "../../components/portal/ResourceMatchCards";

type Match = { id: string; requestId: string; resourceId: string; quantity: number };
const initialNeeds: MatchingNeed[] = [
  { id: "REQ001", category: "Food Supplies", county: "Nairobi", required: 10, allocated: 0, unit: "packages" },
  { id: "REQ002", category: "Medical Supplies", county: "Kiambu", required: 5, allocated: 0, unit: "kits" },
  { id: "REQ003", category: "Clothing", county: "Machakos", required: 20, allocated: 0, unit: "packages" },
  { id: "REQ004", category: "Shelter", county: "Kajiado", required: 4, allocated: 0, unit: "kits" },
];
const initialResources: MatchingResource[] = [
  { id: "RES001", category: "Food Supplies", county: "Nairobi", available: 15, unit: "packages" },
  { id: "RES002", category: "Medical Supplies", county: "Kiambu", available: 7, unit: "kits" },
  { id: "RES003", category: "Clothing", county: "Machakos", available: 12, unit: "packages" },
  { id: "RES004", category: "Shelter", county: "Kajiado", available: 3, unit: "kits" },
];
const panel = "rounded-xl bg-white p-6 shadow-sm";
const field = "w-full rounded-lg border border-gray-300 p-3";

export default function ResourceMatching() {
  const [needs, setNeeds] = useState(initialNeeds);
  const [resources, setResources] = useState(initialResources);
  const [matches, setMatches] = useState<Match[]>([]);
  const [needId, setNeedId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const need = needs.find((item) => item.id === needId);
  const compatible = resources.filter((item) =>
    need && item.category === need.category && item.unit === need.unit && item.available > 0
  );
  const resource = compatible.find((item) => item.id === resourceId);
  const remaining = need ? need.required - need.allocated : 0;
  const maxAmount = resource ? Math.min(remaining, resource.available) : 0;
  const amount = Number(quantity);
  const canAllocate = !!need && !!resource && Number.isInteger(amount) && amount > 0 && amount <= maxAmount;

  function allocate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAllocate || !need || !resource) return;
    setNeeds((previous) => previous.map((item) =>
      item.id === need.id ? { ...item, allocated: item.allocated + amount } : item
    ));
    setResources((previous) => previous.map((item) =>
      item.id === resource.id ? { ...item, available: item.available - amount } : item
    ));
    setMatches((previous) => [...previous, { id: crypto.randomUUID(), requestId: need.id, resourceId: resource.id, quantity: amount }]);
    setNeedId(""); setResourceId(""); setQuantity("1");
  }

  const stats = [
    { label: "Total Requests", value: needs.length, icon: HeartHandshake },
    { label: "Available Resource Types", value: resources.filter((r) => r.available > 0).length, icon: Package },
    { label: "Fully Matched Requests", value: needs.filter((n) => n.allocated === n.required).length, icon: CheckCircle },
  ];

  return (
    <main className="min-h-screen space-y-8 bg-gray-100 p-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Resource Matching</h1>
        <p className="mt-2 text-gray-600">Match available humanitarian resources with beneficiary needs.</p>
        <p className="mt-2 text-sm text-amber-700">Demo mode — allocations are not saved to the database.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={panel}>
            <Icon className="mb-3 text-green-600" />
            <p className="text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className={panel}>
          <h2 className="mb-5 text-xl font-semibold">Beneficiary Needs</h2>
          <div className="space-y-4">
            {needs.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{item.category} <span className="float-right text-sm font-normal text-gray-500">{item.id}</span></h3>
                <p className="mt-2 text-sm text-gray-600">{item.county} · Required: {item.required} {item.unit}</p>
                <p className="mt-1 text-sm text-gray-600">Allocated: {item.allocated} · Remaining: {item.required - item.allocated}</p>
                <div className="mt-3 h-2 rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-600" style={{ width: `${(item.allocated / item.required) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={panel}>
          <h2 className="mb-5 text-xl font-semibold">Available Resources</h2>
          <div className="space-y-4">
            {resources.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{item.category} <span className="float-right text-sm font-normal text-gray-500">{item.id}</span></h3>
                <p className="mt-2 text-sm text-gray-600">Location: {item.county}</p>
                <p className="mt-1 font-semibold text-green-700">Available: {item.available} {item.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ResourceMatchCards needs={needs} resources={resources} onSelectMatch={(n, r, q) => {
        setNeedId(n); setResourceId(r); setQuantity(String(q));
      }} />

      <section className={panel} id="allocate-resources">
        <h2 className="mb-5 text-xl font-semibold">Allocate Resources</h2>
        <form onSubmit={allocate} className="space-y-5">
          <div>
            <label htmlFor="matching-request" className="mb-2 block font-medium">Beneficiary Request</label>
            <select id="matching-request" className={field} value={needId} required onChange={(e) => {
              setNeedId(e.target.value); setResourceId(""); setQuantity("1");
            }}>
              <option value="">Select request</option>
              {needs.filter((n) => n.allocated < n.required).map((n) => (
                <option key={n.id} value={n.id}>{n.id} – {n.category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="matching-resource" className="mb-2 block font-medium">Available Resource</label>
            <select id="matching-resource" className={field} value={resourceId} required disabled={!need} onChange={(e) => {
              setResourceId(e.target.value); setQuantity("1");
            }}>
              <option value="">Select resource</option>
              {compatible.map((r) => (
                <option key={r.id} value={r.id}>{r.category} – {r.county} ({r.available} {r.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="matching-quantity" className="mb-2 block font-medium">Allocation Quantity</label>
            <input id="matching-quantity" className={field} type="number" min="1" max={maxAmount || undefined}
              value={quantity} required onChange={(e) => setQuantity(e.target.value)} />
            {resource && <p className="mt-2 text-sm text-gray-500">Maximum allocation: {maxAmount}</p>}
          </div>
          <button type="submit" disabled={!canAllocate}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700 disabled:opacity-50">
            Allocate Resource <ArrowRight size={18} />
          </button>
        </form>
      </section>

      <section className={panel}>
        <h2 className="mb-5 text-xl font-semibold">Allocation History</h2>
        {matches.length === 0 ? <p className="text-gray-500">No resources allocated yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50"><tr><th className="p-3">Request</th><th className="p-3">Resource</th><th className="p-3">Quantity</th></tr></thead>
              <tbody>{matches.map((m) => (
                <tr key={m.id} className="border-b"><td className="p-3">{m.requestId}</td><td className="p-3">{m.resourceId}</td><td className="p-3">{m.quantity}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
