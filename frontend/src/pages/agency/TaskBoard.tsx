import { useState, type FormEvent } from "react";
import { ClipboardList, Clock, CheckCircle, Plus, Search } from "lucide-react";
import KanbanBoard from "../../components/portal/KanbanBoard";
import type { AgencyTask, TaskStatus, TaskPriority } from "../../components/portal/KanbanBoard";

const initialTasks: AgencyTask[] = [
  { id: "TASK001", title: "Review emergency food requests", assignedTo: "Assessment Team", priority: "Critical", status: "To Do", dueDate: "2026-11-20" },
  { id: "TASK002", title: "Verify available medical supplies", assignedTo: "Inventory Team", priority: "High", status: "In Progress", dueDate: "2026-11-21" },
  { id: "TASK003", title: "Coordinate clothing distribution", assignedTo: "Distribution Team", priority: "Normal", status: "Completed", dueDate: "2026-11-17" }
];
const inputClass = "w-full rounded-lg border border-gray-300 p-3";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<AgencyTask[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Normal");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const query = search.trim().toLowerCase();
  const visible = tasks.filter(t => [t.title, t.assignedTo, t.priority, t.id].some(s => s.toLowerCase().includes(query)));
  const stats = [
    { title: "Total Tasks", value: tasks.length, icon: ClipboardList },
    { title: "To Do", value: tasks.filter(t => t.status === "To Do").length, icon: Clock },
    { title: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, icon: ClipboardList },
    { title: "Completed", value: tasks.filter(t => t.status === "Completed").length, icon: CheckCircle }
  ];

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !assignedTo.trim()) return setError("Enter a task title and assignee.");
    setTasks(prev => [...prev, { id: crypto.randomUUID(), title: title.trim(), assignedTo: assignedTo.trim(), priority, status: "To Do", dueDate }]);
    setTitle(""); setAssignedTo(""); setPriority("Normal"); setDueDate(""); setError(""); setShowForm(false);
  }
  function updateTaskStatus(id: string, status: TaskStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }
  function deleteTask(id: string) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Agency Task Board</h1>
          <p className="mt-2 text-gray-600">Assign, organize, and track humanitarian agency tasks.</p>
          <p className="mt-2 text-sm text-amber-700">Demo mode — tasks are not saved to the database.</p>
        </div>
        <button type="button" onClick={() => { setShowForm(s => !s); setError(""); }} className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700">
          <Plus size={20} /> Add New Task
        </button>
      </header>
      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon className="mb-3 text-green-600" /><p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </section>

      {showForm && <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Create New Task</h2>
        <form onSubmit={addTask} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="block font-medium">Task Title
            <input required value={title} onChange={e => setTitle(e.target.value)} className={`mt-2 ${inputClass}`} />
          </label>
          <label className="block font-medium">Assign To
            <input required value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Team or staff member" className={`mt-2 ${inputClass}`} />
          </label>
          <label className="block font-medium">Priority
            <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={`mt-2 ${inputClass}`}>
              {(["Critical", "High", "Normal"] as TaskPriority[]).map(p => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="block font-medium">Deadline
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`mt-2 ${inputClass}`} />
          </label>
          {error && <p role="alert" className="text-sm text-red-600 md:col-span-2">{error}</p>}
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="rounded-lg bg-green-600 px-6 py-3 text-white">Create Task</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-6 py-3">Cancel</button>
          </div>
        </form>
      </section>}

      <div className="mb-6 flex items-center gap-3">
        <Search size={20} className="text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" className={`${inputClass} max-w-md`} />
      </div>
      <KanbanBoard tasks={visible} onStatusChange={updateTaskStatus} onDelete={deleteTask} />
    </main>
  );
}
