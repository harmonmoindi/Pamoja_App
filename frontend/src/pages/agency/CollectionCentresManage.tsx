import { useState, type FormEvent } from "react";
import { Building2, MapPin, Plus, Search, Pencil, Power, AlertTriangle } from "lucide-react";
import useCentres from "../../hooks/useCentres";
import type { CollectionCentre, CentreInput, CentreStatus } from "../../types/centre";

type CentreForm = Omit<CentreInput, "capacity" | "currentLoad"> & { capacity: string; currentLoad: string };
const emptyForm: CentreForm = { name: "", county: "", address: "", contact: "", capacity: "", currentLoad: "0", status: "Active" };
const inputClass = "w-full rounded-lg border border-gray-300 p-3 focus:border-green-600 focus:outline-none";
const fields = [
  { key: "name", label: "Centre Name", required: true, type: "text" },
  { key: "county", label: "County", required: true, type: "text" },
  { key: "address", label: "Address", required: true, type: "text" },
  { key: "contact", label: "Contact Information", required: false, type: "text" },
  { key: "capacity", label: "Storage Capacity", required: true, type: "number", min: 1 },
  { key: "currentLoad", label: "Current Load", required: true, type: "number", min: 0 }
] as const;

export default function CollectionCentresManage() {
  const { centres, addCentre, updateCentre, toggleCentre, activeCount, nearCapacityCount } = useCentres();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CentreForm>({ ...emptyForm });
  const [error, setError] = useState("");

  const filteredCentres = centres.filter(c =>
    [c.name, c.county, c.address, c.id].some(value => value.toLowerCase().includes(search.trim().toLowerCase()))
  );
  const stats = [
    { title: "Total Collection Centres", value: centres.length, icon: Building2, color: "text-green-600" },
    { title: "Active Centres", value: activeCount, icon: MapPin, color: "text-blue-600" },
    { title: "Centres Near Capacity", value: nearCapacityCount, icon: AlertTriangle, color: "text-orange-600" }
  ];

  function openForm(centre?: CollectionCentre) {
    setEditingId(centre?.id ?? null);
    setForm(centre ? { ...centre, capacity: String(centre.capacity), currentLoad: String(centre.currentLoad) } : { ...emptyForm });
    setError("");
    setShowForm(true);
  }

  function saveCentre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const capacity = Number(form.capacity), currentLoad = Number(form.currentLoad);
    if (![form.name, form.county, form.address].every(value => value.trim())) {
      setError("Please complete all required fields.");
      return;
    }
    if (!form.capacity.trim() || !form.currentLoad.trim() || !Number.isSafeInteger(capacity) || capacity <= 0 || !Number.isSafeInteger(currentLoad) || currentLoad < 0) {
      setError("Enter valid whole numbers for capacity and load.");
      return;
    }
    if (currentLoad > capacity) {
      setError("Current load cannot exceed centre capacity.");
      return;
    }
    const data: CentreInput = {
      name: form.name.trim(), county: form.county.trim(), address: form.address.trim(),
      contact: form.contact.trim() || "Not provided", capacity, currentLoad, status: form.status
    };
    if (editingId) updateCentre(editingId, data);
    else addCentre(data);
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Collection Centres</h1>
          <p className="mt-2 text-gray-600">Manage humanitarian collection and distribution centres.</p>
          <p className="mt-2 text-sm text-amber-700">Demo mode — changes are not saved to the database.</p>
        </div>
        <button type="button" onClick={() => openForm()} className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700">
          <Plus size={20} /> Add Collection Centre
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon className={`mb-3 ${color}`} />
            <p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
            {title === "Centres Near Capacity" && <p className="mt-1 text-xs text-gray-500">Active centres at 80% capacity or higher</p>}
          </div>
        ))}
      </div>

      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold">Registered Collection Centres</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search centres..." aria-label="Search collection centres" className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-green-600 focus:outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50"><tr>{["Centre", "County", "Capacity", "Usage", "Status", "Actions"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
            <tbody>
              {filteredCentres.map(centre => {
                const usage = centre.capacity > 0 ? Math.min(100, Math.max(0, centre.currentLoad / centre.capacity * 100)) : 0;
                return (
                  <tr key={centre.id} className="border-b hover:bg-gray-50">
                    <td className="p-4"><p className="font-semibold">{centre.name}</p><p className="text-sm text-gray-500">{centre.address}</p></td>
                    <td className="p-4">{centre.county}</td>
                    <td className="p-4">{centre.capacity} units</td>
                    <td className="p-4">
                      <p className="mb-2 text-sm">{centre.currentLoad} / {centre.capacity}</p>
                      <div className="h-2 w-32 rounded-full bg-gray-200"><div className={`h-2 rounded-full ${usage >= 80 ? "bg-orange-500" : "bg-green-600"}`} style={{ width: `${usage}%` }} /></div>
                    </td>
                    <td className="p-4"><span className={`rounded-full px-3 py-1 text-sm ${centre.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{centre.status}</span></td>
                    <td className="p-4"><div className="flex gap-2">
                      <button type="button" onClick={() => openForm(centre)} aria-label={`Edit ${centre.name}`} className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"><Pencil size={18} /></button>
                      <button type="button" onClick={() => toggleCentre(centre.id)} aria-label={`Toggle status of ${centre.name}`} className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"><Power size={18} /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCentres.length === 0 && <p className="py-8 text-center text-gray-500">No collection centres found.</p>}
        </div>
      </section>

      {showForm && <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">{editingId ? "Edit Collection Centre" : "Register Collection Centre"}</h2>
        <form onSubmit={saveCentre} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map(field => (
            <div key={field.key}>
              <label htmlFor={`centre-${field.key}`} className="mb-2 block font-medium">{field.label}{field.required ? " *" : ""}</label>
              <input id={`centre-${field.key}`} type={field.type} min={"min" in field ? field.min : undefined} step={field.type === "number" ? 1 : undefined} required={field.required}
                value={form[field.key]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))} className={inputClass} />
            </div>
          ))}
          <div>
            <label htmlFor="centre-status" className="mb-2 block font-medium">Centre Status</label>
            <select id="centre-status" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as CentreStatus }))} className={inputClass}>
              <option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
          </div>
          {error && <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>}
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700">{editingId ? "Save Changes" : "Register Centre"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-6 py-3">Cancel</button>
          </div>
        </form>
      </section>}
    </div>
  );
}
