import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Bell, ChevronRight, Clock3, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PortalRole, roleNav } from "@/data/constants/navigation";
import { PortalSidebar } from "./PortalSidebar";

export function PortalLayout({ role }: { role: PortalRole }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const name = user?.name ?? "Pamoja member";
  const pending = user?.status === "pending";
  const notificationsPath = roleNav[role].find(([, href]) => href.endsWith("/notifications"))?.[1];

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
            {notificationsPath ? (
              <Link to={notificationsPath} aria-label="Notifications">
                <Bell size={20} />
                <i />
              </Link>
            ) : (
              <button aria-label="Notifications" type="button">
                <Bell size={20} />
                <i />
              </button>
            )}
            <span className="avatar">{name.slice(0, 1)}</span>
            <div>
              <b>{name}</b>
              <small>{pending ? "Pending verification" : `${role} account`}</small>
            </div>
          </div>
        </header>
        <main className="portal-content">
          {pending && (
            <div className="pending-verification" style={{ marginBottom: 16 }}>
              <Clock3 />
              <div>
                <b>Pending verification</b>
                <small>
                  An administrator still has to review and approve this account. Some actions may be
                  limited until then.
                </small>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
