import { Link, NavLink } from "react-router";
import {
  Bell,
  Check,
  CircleUserRound,
  HandHeart,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { PortalRole, roleNav } from "@/data/constants/navigation";

const navIcons = [
  LayoutDashboard,
  Search,
  HandHeart,
  PackageCheck,
  Bell,
  CircleUserRound,
  ShieldCheck,
  Check,
];

type PortalSidebarProps = {
  role: PortalRole;
  open: boolean;
  onClose: () => void;
};

export function PortalSidebar({ role, open, onClose }: PortalSidebarProps) {
  return (
    <aside className={open ? "sidebar open" : "sidebar"}>
      <div className="sidebar-top">
        <Logo light />
        <button onClick={onClose} className="sidebar-close" aria-label="Close navigation">
          <X />
        </button>
      </div>
      <div className="role-label">{role} workspace</div>
      <nav>
        {roleNav[role].map(([label, href], i) => {
          const Icon = navIcons[i % navIcons.length];
          return (
            <NavLink key={label} to={href} end={href === `/${role}/dashboard`} onClick={onClose}>
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-help">
        <span>Need help?</span>
        <p>Our support team is ready to assist.</p>
        <Link to="/about">Contact support</Link>
      </div>
      {/* Becomes a real "Sign out" button when authentication is added. */}
      <Link className="logout" to="/">
        <LogOut size={18} /> Exit portal
      </Link>
    </aside>
  );
}
