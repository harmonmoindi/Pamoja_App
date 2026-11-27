import { Link, NavLink, useNavigate } from "react-router";
import {
  Bell,
  Check,
  CircleUserRound,
  ClipboardList,
  Clock,
  HandHeart,
  LayoutDashboard,
  List,
  LogOut,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { PortalRole, roleNav } from "@/data/constants/navigation";

const iconsByPath: Record<string, LucideIcon> = {
  "/donor/dashboard": LayoutDashboard,
  "/explore": Search,
  "/donor/donations": HandHeart,
  "/donor/pledges": PackageCheck,
  "/impact": HandHeart,
  "/donor/notifications": Bell,
  "/donor/preferences": CircleUserRound,
  "/beneficiary/dashboard": LayoutDashboard,
  "/beneficiary/request": Plus,
  "/beneficiary/requests": List,
  "/beneficiary/tracking": Clock,
  "/beneficiary/receipt": Check,
  "/beneficiary/notifications": Bell,
  "/agency/dashboard": LayoutDashboard,
  "/agency/requests": ClipboardList,
  "/agency/assessment": Search,
  "/agency/matching": HandHeart,
  "/agency/inventory": PackageCheck,
  "/agency/tasks": Check,
  "/agency/deliveries": PackageCheck,
  "/agency/centres": Search,
  "/agency/appointments": Clock,
  "/admin/dashboard": LayoutDashboard,
  "/admin/verification": ShieldCheck,
  "/admin/users": Users,
  "/admin/requests": ClipboardList,
  "/admin/duplicates": Search,
  "/admin/audit": List,
};

type PortalSidebarProps = {
  role: PortalRole;
  open: boolean;
  onClose: () => void;
};

export function PortalSidebar({ role, open, onClose }: PortalSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/");
  };

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
        {roleNav[role].map(([label, href]) => {
          const Icon = iconsByPath[href] ?? LayoutDashboard;
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
      <button className="logout" type="button" onClick={signOut}>
        <LogOut size={18} /> Sign out
      </button>
    </aside>
  );
}
