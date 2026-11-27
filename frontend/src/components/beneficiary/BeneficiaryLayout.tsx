import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Check,
  Clock,
  Home,
  LayoutDashboard,
  List,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { dashboardPath, useAuth } from "@/context/AuthContext";
import { BeneficiaryMark } from "./BeneficiaryMark";
import { BeneficiaryRequestsProvider } from "./BeneficiaryRequests";

const publicLinks: [string, string][] = [
  ["Home", "/"],
  ["Explore Needs", "/explore"],
  ["How It Works", "/#how"],
  ["Our Impact", "/impact"],
  ["Humanitarian Updates", "/situation"],
  ["About", "/about"],
];

const workspaceLinks: [string, string, typeof LayoutDashboard][] = [
  ["Dashboard", "/beneficiary/dashboard", LayoutDashboard],
  ["Request Assistance", "/beneficiary/request", Plus],
  ["My Requests", "/beneficiary/requests", List],
  ["Request Tracking", "/beneficiary/tracking", Clock],
  ["Confirm Receipt", "/beneficiary/receipt", Check],
  ["Notifications", "/beneficiary/notifications", Bell],
];

export function BeneficiaryLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const close = () => setOpen(false);

  return (
    <BeneficiaryRequestsProvider>
      <div className="bn-app">
        <p className="bn-banner">
          <strong>CONCEPT PROTOTYPE</strong>
          <span> · All requests, agencies, pledges and outcomes are fictional demonstration data. No real donations.</span>
        </p>
        <header className="bn-header">
          <div className="bn-header-start">
            <button className="bn-menu" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
            <BeneficiaryMark to="/" />
          </div>
          <nav className="bn-header-nav" aria-label="Public">
            <div className="bn-nav-links">
              {publicLinks.map(([label, href]) => (
                <Link key={label} to={href}>
                  {label}
                </Link>
              ))}
            </div>
            <div className="bn-nav-actions">
              {user ? (
                <>
                  <Link className="bn-signin" to={dashboardPath(user.role)}>
                    My dashboard
                  </Link>
                  <button className="bn-started" type="button" onClick={logout}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link className="bn-signin" to="/signin">
                    Sign In
                  </Link>
                  <Link className="bn-started" to="/register">
                    Get Started <ArrowUpRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <div className="bn-body">
          {open && <button className="bn-overlay" type="button" aria-label="Close navigation" onClick={close} />}
          <aside className={open ? "bn-sidebar open" : "bn-sidebar"}>
            <div className="bn-side-top">
              <BeneficiaryMark to="/beneficiary/dashboard" tone="light" />
              <button className="bn-side-close" type="button" aria-label="Close navigation" onClick={close}>
                <X size={18} />
              </button>
            </div>
            <p className="bn-role">Beneficiary workspace demo</p>
            <nav className="bn-navlist" aria-label="Beneficiary workspace">
              {workspaceLinks.map(([label, href, Icon]) => (
                <NavLink key={label} to={href} end={href === "/beneficiary/dashboard"} onClick={close}>
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="bn-sidefoot">
              <NavLink to="/beneficiary/workspace" onClick={close}>
                <ArrowLeftRight size={18} />
                Switch workspace
              </NavLink>
              <Link to="/" onClick={close}>
                <Home size={18} />
                Public website
              </Link>
            </div>
            <div className="bn-public-links">
              {publicLinks.map(([label, href]) => (
                <Link key={label} to={href} onClick={close}>
                  {label}
                </Link>
              ))}
            </div>
          </aside>

          <div className="bn-main">
            <Outlet />
            <p className="bn-footnote">
              Pamoja concept prototype · Requests are sent to the agency API for review, then published for donors.
            </p>
          </div>
        </div>
      </div>
    </BeneficiaryRequestsProvider>
  );
}
