import { useState, type FormEvent } from "react";
import { CalendarDays, Clock, CheckCircle, XCircle, Search, CalendarClock } from "lucide-react";
import type { Appointment, AppointmentStatus } from "../../types/appointment";

const initialAppointments: Appointment[] = [
  { id: "APT001", donor: "Donor A", donationType: "Food Supplies", centre: "Nairobi Central Collection Centre", date: "2026-11-19", time: "10:00", status: "Pending" },
  { id: "APT002", donor: "Donor B", donationType: "Clothing", centre: "Kiambu Community Collection Centre", date: "2026-11-20", time: "11:30", status: "Confirmed" },
  { id: "APT003", donor: "Donor C", donationType: "Medical Supplies", centre: "Nakuru Relief Collection Centre", date: "2026-11-21", time: "09:00", status: "Pending" },
  { id: "APT004", donor: "Donor D", donationType: "Food Supplies", centre: "Nairobi Central Collection Centre", date: "2026-11-16", time: "14:00", status: "Completed" }
];

const statusColors: Record<AppointmentStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800"
};

const allowed: Record<AppointmentStatus, AppointmentStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: []
};

const inputClass = "w-full rounded-lg border border-gray-300 p-3 focus:border-green-600 focus:outline-none";
const buttonClass = "rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700";

export default function AppointmentsManage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  const visible = appointments.filter(a =>
    (filter === "All" || a.status === filter) &&
    [a.id, a.donor, a.donationType, a.centre].some(v => v.toLowerCase().includes(search.trim().toLowerCase()))
  );

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: CalendarDays, color: "text-green-600" },
    { label: "Pending Appointments", value: appointments.filter(a => a.status === "Pending").length, icon: Clock, color: "text-yellow-600" },
    { label: "Confirmed Appointments", value: appointments.filter(a => a.status === "Confirmed").length, icon: CalendarClock, color: "text-blue-600" },
    { label: "Completed Appointments", value: appointments.filter(a => a.status === "Completed").length, icon: CheckCircle, color: "text-green-600" }
  ];

  function updateStatus(id: string, next: AppointmentStatus) {
    setAppointments(prev => prev.map(a => a.id === id && allowed[a.status].includes(next) ? { ...a, status: next } : a));
  }

  function openReschedule(a: Appointment) {
    if (!allowed[a.status].length) return;
    setEditingId(a.id);
    setNewDate(a.date);
    setNewTime(a.time);
    setError("");
  }

  function saveReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || !newDate || !newTime) return setError("Please select a date and time.");

    const scheduled = new Date(`${newDate}T${newTime}`);
    if (Number.isNaN(scheduled.getTime()) || scheduled <= new Date())
      return setError("Please select a future appointment date and time.");

    setAppointments(prev => prev.map(a =>
      a.id === editingId && ["Pending", "Confirmed"].includes(a.status)
        ? { ...a, date: newDate, time: newTime, status: "Pending" }
        : a
    ));

    setEditingId(null);
    setNewDate("");
    setNewTime("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Appointments Management</h1>
        <p className="mt-2 text-gray-600">Manage donor appointments and coordinate donation collection.</p>
        <p className="mt-2 text-sm text-amber-700">Demo mode — appointment changes are not saved to the database.</p>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon className={`mb-3 ${color}`} />
            <p className="text-gray-600">{label}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row">
          <h2 className="text-xl font-semibold">Donor Appointments</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} aria-label="Search appointments" placeholder="Search appointments..." className={`${inputClass} pl-10`} />
            </div>

            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter appointments by status" className={inputClass}>
              {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map(s =>
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
              )}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {["Appointment ID", "Donor", "Donation", "Collection Centre", "Date & Time", "Status", "Actions"].map(h =>
                  <th key={h} className="p-4">{h}</th>
                )}
              </tr>
            </thead>

            <tbody>
              {visible.map(a => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{a.id}</td>
                  <td className="p-4">{a.donor}</td>
                  <td className="p-4">{a.donationType}</td>
                  <td className="p-4">{a.centre}</td>
                  <td className="p-4">{a.date}<br /><span className="text-sm text-gray-500">{a.time}</span></td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-sm ${statusColors[a.status]}`}>{a.status}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {a.status === "Pending" &&
                        <button type="button" onClick={() => updateStatus(a.id, "Confirmed")} className={buttonClass}>Confirm</button>}

                      {a.status === "Confirmed" &&
                        <button type="button" onClick={() => updateStatus(a.id, "Completed")} className={buttonClass}>Complete</button>}

                      {allowed[a.status].length > 0 ? <>
                        <button type="button" onClick={() => openReschedule(a)} className="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200">Reschedule</button>
                        <button type="button" onClick={() => updateStatus(a.id, "Cancelled")} className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 hover:bg-red-200">
                          <XCircle size={15} /> Cancel
                        </button>
                      </> : <span className="text-sm text-gray-500">No actions</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && <p className="py-8 text-center text-gray-500">No matching appointments found.</p>}
        </div>
      </section>

      {editingId && (
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">Reschedule Appointment</h2>

          <form onSubmit={saveReschedule}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block font-medium">
                New Appointment Date
                <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className={`mt-2 ${inputClass}`} />
              </label>

              <label className="block font-medium">
                New Appointment Time
                <input type="time" required value={newTime} onChange={e => setNewTime(e.target.value)} className={`mt-2 ${inputClass}`} />
              </label>
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button type="submit" className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700">Save New Schedule</button>
              <button type="button" onClick={() => { setEditingId(null); setError(""); }} className="rounded-lg border border-gray-300 px-5 py-3">Cancel</button>
            </div>

            <p className="mt-4 text-sm text-gray-500">Rescheduled appointments return to Pending and require confirmation again.</p>
          </form>
        </section>
      )}
    </main>
  );
}