import { NavLink } from "react-router";

import {
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  RefreshCw,
  Package,
  Building2,
  CalendarDays,
  Truck,
  ListTodo,
  HeartHandshake,
  X,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/agency",
    icon: LayoutDashboard,
  },
  {
    name: "Assistance Requests",
    path: "/agency/requests",
    icon: ClipboardList,
  },
  {
    name: "Needs Assessment",
    path: "/agency/assessments",
    icon: ClipboardCheck,
  },
  {
    name: "Resource Matching",
    path: "/agency/matching",
    icon: RefreshCw,
  },
  {
    name: "Inventory",
    path: "/agency/inventory",
    icon: Package,
  },
  {
    name: "Collection Centres",
    path: "/agency/centres",
    icon: Building2,
  },
  {
    name: "Appointments",
    path: "/agency/appointments",
    icon: CalendarDays,
  },
  {
    name: "Deliveries",
    path: "/agency/deliveries",
    icon: Truck,
  },
  {
    name: "Task Board",
    path: "/agency/tasks",
    icon: ListTodo,
  },
];

interface AgencySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgencySidebar({
  isOpen,
  onClose,
}: AgencySidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
      bg-green-900 text-white transition-transform duration-300
      md:static md:translate-x-0 md:shrink-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between border-b border-green-700 p-6">
        <div className="flex items-center gap-3">
          <HeartHandshake size={30} />

          <div>
            <h1 className="text-xl font-bold">Pamoja</h1>
            <p className="text-xs text-green-200">
              Agency Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="md:hidden"
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/agency"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3
                transition-colors ${
                  isActive
                    ? "bg-green-600 font-semibold text-white"
                    : "text-green-100 hover:bg-green-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-green-700 p-5">
        <p className="text-sm text-green-200">
          Pamoja Humanitarian Platform
        </p>
        <p className="mt-1 text-xs text-green-300">
          Connecting Needs, Resources & Impact
        </p>
      </div>
    </aside>
  );
}