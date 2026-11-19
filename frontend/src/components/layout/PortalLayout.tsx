import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { PortalRole } from "@/data/constants/navigation";
import { PortalSidebar } from "./PortalSidebar";

export function PortalLayout({ role }: { role: PortalRole }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  // Replace with the signed-in user's name once authentication is added.
  const name = "Pamoja member";
  return (
    <div className="portal-shell">
      <PortalSidebar role={role} open={open} onClose={() => setOpen(false)} />
      <div className="portal-main">
        <header className="portal-topbar">
          <button className="portal-menu" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <div className="crumb">
            {role} portal <ChevronRight size={15} />{" "}
            <b>{location.pathname.split("/").pop()?.replace("-", " ") || "Overview"}</b>
          </div>
          <div className="profile">
            <button aria-label="Notifications">
              <Bell size={20} />
              <i />
            </button>
            <span className="avatar">{name.slice(0, 1)}</span>
            <div>
              <b>{name}</b>
              <small>{role === "agency" ? "Verified demonstration organization" : `${role} demo account`}</small>
            </div>
          </div>
        </header>
        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
