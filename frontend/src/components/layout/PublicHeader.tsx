import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { dashboardPath, useAuth } from "@/context/AuthContext";

const links: [string, string][] = [
  ["Home", "/"],
  ["Explore needs", "/explore"],
  ["Needs map", "/needs-map"],
  ["How it works", "/#how"],
  ["Our impact", "/impact"],
  ["Situation centre", "/situation"],
  ["About us", "/about"],
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="public-header">
      <div className="container nav-wrap">
        <Logo />
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "public-nav open" : "public-nav"}>
          {links.map(([label, href]) => (
            <Link key={label} to={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <div className="nav-actions">
            {user ? (
              <>
                <Button to={dashboardPath(user.role)} variant="ghost">
                  My dashboard
                </Button>
                <Button variant="outline" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button to="/signin" variant="ghost">
                  Sign in
                </Button>
                <Button to="/register">
                  Get started <ArrowRight size={16} />
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
