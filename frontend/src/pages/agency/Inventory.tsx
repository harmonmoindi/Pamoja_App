import { useState, type FormEvent } from "react";
import { Package, Boxes, AlertTriangle, Search, PackagePlus } from "lucide-react";

type MovementType = "Stock Received" | "Stock Distributed" | "Stock Adjustment";
interface InventoryItem {
  id: string; name: string; category: string; county: string; quantity: number;
  unit: string; minimum: number;
}
interface StockMovement {
  id: string; item: string; type: MovementType; quantity: number; date: string; notes: string;
}
const initialInventory: InventoryItem[] = [
  { id: "INV001", name: "Food Packages", category: "Food Supplies", county: "Nairobi", quantity: 15, unit: "packages", minimum: 5 },
  { id: "INV002", name: "Medical Kits", category: "Medical Supplies", county: "Kiambu", quantity: 7, unit: "kits", minimum: 3 },
  { id: "INV003", name: "Clothing Packages", category: "Clothing", county: "Machakos", quantity: 12, unit: "packages", minimum: 5 },
  { id: "INV004", name: "Shelter Kits", category: "Shelter", county: "Kajiado", quantity: 3, unit: "kits", minimum: 5 }
];
const inputClass = "w-full rounded-lg border border-gray-300 p-3";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState("");
  const [itemId, setItemId] = useState("");
  const [movementType, setMovementType] = useState<MovementType>("Stock Received");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const selectedItem = inventory.find(item => item.id === itemId);
  const query = search.trim().toLowerCase();
  const visible = inventory.filter(item => [item.id, item.name, item.category, item.county].some(s => s.toLowerCase().includes(query)));
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = inventory.filter(item => item.quantity <= item.minimum).length;
  const stats = [
    { title: "Inventory Items", value: inventory.length, icon: Package, color: "text-green-600" },
    { title: "Total Stock Units", value: totalUnits, icon: Boxes, color: "text-blue-600" },
    { title: "Low Stock Alerts", value: lowStock, icon: AlertTriangle, color: "text-red-600" }
  ];

  function recordMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const amount = Number(quantity);
    if (!selectedItem || !Number.isInteger(amount) || amount < 0 || (amount === 0 && movementType !== "Stock Adjustment"))
      return setError("Choose an item and enter a valid whole-number quantity.");
    const newQuantity = movementType === "Stock Received" ? selectedItem.quantity + amount
      : movementType === "Stock Distributed" ? selectedItem.quantity - amount : amount;
    if (newQuantity < 0) return setError("Cannot distribute more stock than is available.");
    setInventory(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    setMovements(prev => [{ id: crypto.randomUUID(), item: selectedItem.name, type: movementType,
      quantity: amount, date: new Date().toLocaleString(), notes: notes.trim() }, ...prev]);
    setItemId(""); setQuantity("1"); setNotes("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <p className="mt-2 text-gray-600">Monitor humanitarian supplies, donations, and stock movements.</p>
        <p className="mt-2 text-sm text-amber-700">Demo mode — inventory changes are not saved to the database.</p>
      </header>
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon size={22} className={`mb-3 ${color}`} /><p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
            {title === "Total Stock Units" && <p className="mt-1 text-xs text-gray-500">Combined count across different resource types</p>}
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold">Available Inventory</h2>
          <div className="relative"><Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." aria-label="Search inventory" className={`${inputClass} pl-10`} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50"><tr>
              {["Item ID", "Resource", "Category", "County", "Quantity", "Status"].map(h => <th key={h} className="p-4">{h}</th>)}
            </tr></thead>
            <tbody>{visible.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-semibold">{item.id}</td><td className="p-4">{item.name}</td>
                <td className="p-4">{item.category}</td><td className="p-4">{item.county}</td>
                <td className="p-4">{item.quantity} {item.unit}</td>
                <td className="p-4"><span className={`rounded-full px-3 py-1 ${item.quantity <= item.minimum ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {item.quantity <= item.minimum ? "Low Stock" : "Available"}
                </span></td>
              </tr>
            ))}</tbody>
          </table>
          {!visible.length && <p className="py-8 text-center text-gray-500">No inventory items found.</p>}
        </div>
      </section>

      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold"><PackagePlus size={22} className="text-green-600" /> Record Stock Movement</h2>
        <form onSubmit={recordMovement} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="block font-medium">Select Resource
            <select required value={itemId} onChange={e => setItemId(e.target.value)} className={`mt-2 ${inputClass}`}>
              <option value="">Select inventory item</option>
              {inventory.map(item => <option key={item.id} value={item.id}>{item.name} — {item.county} ({item.quantity} {item.unit})</option>)}
            </select>
          </label>
          <label className="block font-medium">Movement Type
            <select value={movementType} onChange={e => setMovementType(e.target.value as MovementType)} className={`mt-2 ${inputClass}`}>
              {(["Stock Received", "Stock Distributed", "Stock Adjustment"] as MovementType[]).map(type => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="block font-medium">{movementType === "Stock Adjustment" ? "New Stock Quantity" : "Quantity"}
            <input type="number" required min={movementType === "Stock Adjustment" ? 0 : 1} step="1" value={quantity} onChange={e => setQuantity(e.target.value)} className={`mt-2 ${inputClass}`} />
          </label>
          <label className="block font-medium">Notes (optional)
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reference or reason" className={`mt-2 ${inputClass}`} />
          </label>
          {error && <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>}
          <div className="md:col-span-2"><button type="submit" className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700">Record Movement</button></div>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold">Stock Movement History</h2>
        {!movements.length ? <p className="text-gray-500">No stock movements recorded yet.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="bg-gray-50"><tr>{["Date", "Resource", "Movement Type", "Quantity", "Notes"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead>
            <tbody>{movements.map(m => <tr key={m.id} className="border-b">
              <td className="p-4">{m.date}</td><td className="p-4">{m.item}</td><td className="p-4">{m.type}</td>
              <td className="p-4">{m.quantity}</td><td className="p-4">{m.notes || "—"}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
