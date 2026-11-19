import { useState } from "react";
import { Outlet } from "react-router";
import { Menu, Bell } from "lucide-react";

import AgencySidebar from "./AgencySidebar";

export default function AgencyLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 md:flex">

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <AgencySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">

        <header className="sticky top-0 z-30 flex items-center
        justify-between border-b bg-white px-6 py-4 shadow-sm">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Agency Management Portal
              </h2>

              <p className="text-sm text-gray-500">
                Humanitarian Coordination Dashboard
              </p>
            </div>

          </div>

          <div className="flex items-center gap-5">

            <Bell
              size={22}
              className="text-gray-600"
            />

            <div className="flex h-10 w-10 items-center
            justify-center rounded-full bg-green-700
            font-semibold text-white">
              A
            </div>

          </div>

        </header>

        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
}